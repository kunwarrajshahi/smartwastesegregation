"""Analytics and Environmental Impact Computation Service.

Provides aggregated waste telemetry, time-series metrics, recyclable stream breakdowns,
and transparent environmental impact estimates using documented factors.
"""

import io
import csv
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.scan import Scan
from app.models.recycling_rule import RecyclingRule


class AnalyticsService:
    """Computes waste management and circular economy performance metrics."""

    @staticmethod
    def get_overview(db: Session, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates macro metrics from actual database scan telemetry."""
        query = db.query(Scan)
        if user_id:
            query = query.filter(Scan.user_id == user_id)

        total_scans = query.count()

        if total_scans == 0:
            # Baseline when database has no records yet
            return {
                "total_scans": 0,
                "total_weight_kg": 0.0,
                "diverted_weight_kg": 0.0,
                "landfill_diversion_rate": 0.0,
                "average_confidence": 0.0,
                "recyclable_scans_count": 0,
                "compostable_scans_count": 0,
                "residual_scans_count": 0,
            }

        total_weight = db.query(func.sum(Scan.weight_kg))
        if user_id:
            total_weight = total_weight.filter(Scan.user_id == user_id)
        total_weight_val = round(float(total_weight.scalar() or 0.0), 2)

        avg_conf = db.query(func.avg(Scan.confidence))
        if user_id:
            avg_conf = avg_conf.filter(Scan.user_id == user_id)
        avg_conf_val = round(float(avg_conf.scalar() or 0.0) * 100, 2)

        # Calculate stream classifications
        rules = {r.category_key: r for r in db.query(RecyclingRule).all()}

        scans = query.all()
        diverted_kg = 0.0
        recyclable_count = 0
        compostable_count = 0
        residual_count = 0

        for s in scans:
            cat_key = s.predicted_class.lower().replace(" ", "_")
            rule = rules.get(cat_key)
            diversion_factor = rule.landfill_diversion_factor if rule else 0.0
            diverted_kg += s.weight_kg * diversion_factor

            if rule:
                if rule.recyclability_type == "recyclable":
                    recyclable_count += 1
                elif rule.recyclability_type == "compostable":
                    compostable_count += 1
                else:
                    residual_count += 1
            else:
                residual_count += 1

        diversion_rate = round((diverted_kg / total_weight_val * 100), 2) if total_weight_val > 0 else 0.0

        return {
            "total_scans": total_scans,
            "total_weight_kg": total_weight_val,
            "diverted_weight_kg": round(diverted_kg, 2),
            "landfill_diversion_rate": diversion_rate,
            "average_confidence": avg_conf_val,
            "recyclable_scans_count": recyclable_count,
            "compostable_scans_count": compostable_count,
            "residual_scans_count": residual_count,
        }

    @staticmethod
    def get_category_distribution(db: Session, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns total scans and aggregate weight grouped by category."""
        query = db.query(
            Scan.predicted_class,
            func.count(Scan.id).label("count"),
            func.sum(Scan.weight_kg).label("total_weight"),
        )
        if user_id:
            query = query.filter(Scan.user_id == user_id)

        rows = query.group_by(Scan.predicted_class).order_by(desc("count")).all()
        total_scans = db.query(Scan).count() or 1

        rules = {r.category_key: r for r in db.query(RecyclingRule).all()}

        results = []
        for cat_name, count, weight in rows:
            cat_key = cat_name.lower().replace(" ", "_")
            rule = rules.get(cat_key)
            results.append({
                "category": cat_name,
                "category_key": cat_key,
                "count": count,
                "weight_kg": round(float(weight or 0.0), 3),
                "percentage": round((count / total_scans) * 100, 2),
                "recyclability": rule.recyclability_type if rule else "unknown",
                "bin_name": rule.bin_name if rule else "General Bin",
                "bin_color": rule.bin_color if rule else "#64748B",
            })

        return results

    @staticmethod
    def get_environmental_impact(db: Session, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Calculates environmental savings using transparent and documented emission factors."""
        rules = {r.category_key: r for r in db.query(RecyclingRule).all()}

        query = db.query(Scan)
        if user_id:
            query = query.filter(Scan.user_id == user_id)
        scans = query.all()

        total_weight = 0.0
        diverted_weight = 0.0
        co2_avoided_kg = 0.0

        for s in scans:
            total_weight += s.weight_kg
            cat_key = s.predicted_class.lower().replace(" ", "_")
            rule = rules.get(cat_key)
            if rule:
                diverted_weight += s.weight_kg * rule.landfill_diversion_factor
                co2_avoided_kg += s.weight_kg * rule.co2_emission_factor

        # Standard EPA equivalents:
        # ~21 kg CO2 absorbed per tree per year
        trees_equivalent = round(co2_avoided_kg / 21.77, 2)
        # ~2.31 kg CO2 per liter of gasoline combusted (~8.89 kg per gallon -> ~2.4 miles/kg)
        gasoline_liters_saved = round(co2_avoided_kg / 2.31, 2)
        passenger_vehicle_miles = round(co2_avoided_kg * 2.48, 1)
        # ~0.85 kWh per kg CO2 in standard grid mix
        energy_saved_kwh = round(co2_avoided_kg * 0.85, 2)

        diversion_rate = round((diverted_weight / total_weight * 100), 1) if total_weight > 0 else 0.0

        return {
            "total_scans": len(scans),
            "total_weight_kg": round(total_weight, 2),
            "total_diverted_kg": round(diverted_weight, 2),
            "landfill_diverted_kg": round(diverted_weight, 2),
            "landfill_diversion_rate_pct": diversion_rate,
            "co2_avoided_kg": round(co2_avoided_kg, 2),
            "co2e_avoided_kg": round(co2_avoided_kg, 2),
            "equivalents": {
                "trees_seedlings_grown_10_yrs": trees_equivalent,
                "gasoline_liters_avoided": gasoline_liters_saved,
                "energy_conserved_kwh": energy_saved_kwh,
            },
            "epa_equivalents": {
                "seedlings_grown_10_years": trees_equivalent,
                "passenger_vehicle_miles_avoided": passenger_vehicle_miles,
                "kwh_electricity_saved": energy_saved_kwh,
            },
            "calculation_methodology": (
                "Estimated carbon offset and diversion calculated using material density "
                "factors and EPA Waste Reduction Model (WARM) emission coefficients."
            ),
            "is_estimate": True,
        }

    @staticmethod
    def get_trends(db: Session, timeframe: str = "daily", user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Calculates time series activity for daily, weekly, or monthly intervals."""
        days_back = 7 if timeframe == "weekly" else (30 if timeframe == "monthly" else 7)
        start_date = datetime.utcnow() - timedelta(days=days_back)

        query = db.query(Scan).filter(Scan.created_at >= start_date)
        if user_id:
            query = query.filter(Scan.user_id == user_id)
        scans = query.all()

        rules = {r.category_key: r for r in db.query(RecyclingRule).all()}

        # Group by day string 'YYYY-MM-DD'
        timeline: Dict[str, Dict[str, Any]] = {}
        for i in range(days_back):
            d = (datetime.utcnow() - timedelta(days=days_back - 1 - i)).strftime("%Y-%m-%d")
            timeline[d] = {
                "date": d,
                "total_scans": 0,
                "recyclable_scans": 0,
                "compostable_scans": 0,
                "residual_scans": 0,
                "weight_kg": 0.0,
            }

        for s in scans:
            d_str = s.created_at.strftime("%Y-%m-%d")
            if d_str in timeline:
                timeline[d_str]["total_scans"] += 1
                timeline[d_str]["weight_kg"] = round(timeline[d_str]["weight_kg"] + s.weight_kg, 3)

                cat_key = s.predicted_class.lower().replace(" ", "_")
                rule = rules.get(cat_key)
                if rule:
                    if rule.recyclability_type == "recyclable":
                        timeline[d_str]["recyclable_scans"] += 1
                    elif rule.recyclability_type == "compostable":
                        timeline[d_str]["compostable_scans"] += 1
                    else:
                        timeline[d_str]["residual_scans"] += 1
                else:
                    timeline[d_str]["residual_scans"] += 1

        return list(timeline.values())

    @staticmethod
    def export_scans_csv(db: Session, user_id: Optional[str] = None) -> str:
        """Generates CSV text containing full scan history with compliance columns."""
        query = db.query(Scan)
        if user_id:
            query = query.filter(Scan.user_id == user_id)
        scans = query.order_by(desc(Scan.created_at)).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Scan ID",
            "Timestamp",
            "Filename",
            "Predicted Class",
            "Confidence %",
            "Weight (kg)",
            "Destination Bin",
            "Verified Status",
            "Verified By",
            "Notes",
        ])

        for s in scans:
            writer.writerow([
                s.id,
                s.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                s.filename,
                s.predicted_class,
                f"{s.confidence_percentage:.2f}%",
                f"{s.weight_kg:.3f}",
                s.destination_bin,
                "Verified" if s.is_verified else "Pending",
                s.verified_by or "",
                s.notes or "",
            ])

        return output.getvalue()
