"""Database Connection and Session Management Module.

Configures SQLAlchemy engine, session maker, base declarative model,
and database initialization/seeding utilities.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import settings

logger = logging.getLogger("smart_waste_api.database")

# SQLite requires check_same_thread=False for FastAPI multithreaded requests
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency to yield a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initializes tables and seeds standard recycling rules and default admin."""
    # Ensure uploads directory exists
    settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    # Import models so Base.metadata knows about them
    from app.models.user import User
    from app.models.scan import Scan
    from app.models.recycling_rule import RecyclingRule
    from app.models.audit_log import AuditLog
    from app.models.system_setting import SystemSetting
    from app.utils.security import hash_password
    import uuid
    from datetime import datetime, timedelta

    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed default recycling rules if not present
    with SessionLocal() as db:
        rules_count = db.query(RecyclingRule).count()
        if rules_count == 0:
            logger.info("Seeding default RealWaste recycling rules with documented environmental factors...")
            default_rules = [
                RecyclingRule(
                    category_key="cardboard",
                    display_name="Cardboard",
                    recyclability_type="recyclable",
                    bin_name="Blue Recycling Bin",
                    bin_color="#2563EB",
                    preparation_guide="Flatten corrugated boxes to conserve space. Remove heavy plastic packing tape and labels.",
                    co2_emission_factor=1.20,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="food_organics",
                    display_name="Food Organics",
                    recyclability_type="compostable",
                    bin_name="Green Compost Bin",
                    bin_color="#16A34A",
                    preparation_guide="Deposit into organic compost receptacle. Remove plastic stickers, twist ties, or produce netting.",
                    co2_emission_factor=0.85,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="glass",
                    display_name="Glass",
                    recyclability_type="recyclable",
                    bin_name="Teal Glass Bin",
                    bin_color="#0D9488",
                    preparation_guide="Rinse out liquid residue. Remove metal lids and caps (recycle separately). Do not break glass.",
                    co2_emission_factor=0.30,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="metal",
                    display_name="Metal",
                    recyclability_type="recyclable",
                    bin_name="Yellow Metal Bin",
                    bin_color="#D97706",
                    preparation_guide="Rinse aluminum and tin cans clean. Aerosol cans must be empty and depressurized.",
                    co2_emission_factor=4.20,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="miscellaneous_trash",
                    display_name="Miscellaneous Trash",
                    recyclability_type="non_recyclable",
                    bin_name="Grey Landfill Bin",
                    bin_color="#64748B",
                    preparation_guide="Bag non-recyclable residual waste tightly to prevent windblown litter.",
                    co2_emission_factor=0.00,
                    landfill_diversion_factor=0.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="paper",
                    display_name="Paper",
                    recyclability_type="recyclable",
                    bin_name="Blue Paper Bin",
                    bin_color="#0284C7",
                    preparation_guide="Keep office paper, newspapers, and envelopes clean and dry. Remove plastic spiral bindings.",
                    co2_emission_factor=1.10,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="plastic",
                    display_name="Plastic",
                    recyclability_type="recyclable",
                    bin_name="Blue Plastics Bin",
                    bin_color="#2563EB",
                    preparation_guide="Empty all contents, rinse container, and screw the plastic cap back on.",
                    co2_emission_factor=1.50,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="textile_trash",
                    display_name="Textile Trash",
                    recyclability_type="special",
                    bin_name="Purple Textile Depot",
                    bin_color="#9333EA",
                    preparation_guide="Deliver clean, dry fabrics and footwear to clothing reclamation or donation drop-boxes.",
                    co2_emission_factor=2.20,
                    landfill_diversion_factor=0.70,
                    is_active=True,
                ),
                RecyclingRule(
                    category_key="vegetation",
                    display_name="Vegetation",
                    recyclability_type="compostable",
                    bin_name="Green Yard Waste Bin",
                    bin_color="#15803D",
                    preparation_guide="Collect foliage, branches, and trimmings into unlined municipal green yard waste containers.",
                    co2_emission_factor=0.65,
                    landfill_diversion_factor=1.00,
                    is_active=True,
                ),
            ]
            db.add_all(default_rules)
            db.commit()
            logger.info("Default RealWaste recycling rules successfully seeded.")

        # Seed default system settings
        settings_count = db.query(SystemSetting).count()
        if settings_count == 0:
            logger.info("Seeding default system settings...")
            default_setting = SystemSetting(
                id="default",
                model_type="yolov11n-seg",
                confidence_threshold=85,
                actuator_delay_ms=140,
                enable_pneumatic_diversion=True,
                hazard_alert_sound=True,
                auto_save_telemetry=True,
            )
            db.add(default_setting)
            db.commit()

        # Seed default users if none exist
        user_count = db.query(User).count()
        admin_user_id = None
        if user_count == 0:
            logger.info("Seeding default administrator and operator accounts...")
            admin_id = str(uuid.uuid4())
            admin_user_id = admin_id
            admin_user = User(
                id=admin_id,
                email="admin@ecosort.ai",
                hashed_password=hash_password("admin123"),
                full_name="System Administrator",
                role="admin",
                is_active=True,
            )
            operator_user = User(
                id=str(uuid.uuid4()),
                email="operator@ecosort.ai",
                hashed_password=hash_password("operator123"),
                full_name="Sarah Jenkins",
                role="operator",
                is_active=True,
            )
            db.add_all([admin_user, operator_user])
            db.commit()

        # Seed initial realistic scans if none exist
        scans_count = db.query(Scan).count()
        if scans_count == 0:
            logger.info("Seeding initial scan telemetry for dashboard & analytics...")
            now = datetime.utcnow()
            initial_scans = [
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="water_bottle_pet.jpg",
                    image_url="/samples/plastic.jpg",
                    predicted_class="Plastic",
                    confidence=0.9638,
                    confidence_percentage=96.38,
                    top_predictions=[
                        {"class": "Plastic", "confidence": 0.9638},
                        {"class": "Glass", "confidence": 0.0210},
                        {"class": "Paper", "confidence": 0.0080},
                    ],
                    weight_kg=0.045,
                    destination_bin="Blue Plastics Bin",
                    is_verified=True,
                    verified_by="System Administrator",
                    notes="Clear beverage bottle properly compacted.",
                    created_at=now - timedelta(minutes=4),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="amazon_shipping_box.png",
                    image_url="/samples/cardboard.jpg",
                    predicted_class="Cardboard",
                    confidence=0.9412,
                    confidence_percentage=94.12,
                    top_predictions=[
                        {"class": "Cardboard", "confidence": 0.9412},
                        {"class": "Paper", "confidence": 0.0450},
                        {"class": "Miscellaneous Trash", "confidence": 0.0080},
                    ],
                    weight_kg=0.220,
                    destination_bin="Blue Recycling Bin",
                    is_verified=True,
                    verified_by="System Administrator",
                    notes="Clean corrugated carton.",
                    created_at=now - timedelta(minutes=18),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="apple_core_banana_peels.jpg",
                    image_url="/samples/food_organics.jpg",
                    predicted_class="Food Organics",
                    confidence=0.9855,
                    confidence_percentage=98.55,
                    top_predictions=[
                        {"class": "Food Organics", "confidence": 0.9855},
                        {"class": "Vegetation", "confidence": 0.0120},
                        {"class": "Miscellaneous Trash", "confidence": 0.0015},
                    ],
                    weight_kg=0.180,
                    destination_bin="Green Compost Bin",
                    is_verified=False,
                    created_at=now - timedelta(hours=1),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="crushed_aluminum_can.jpg",
                    image_url="/samples/metal.jpg",
                    predicted_class="Metal",
                    confidence=0.9720,
                    confidence_percentage=97.20,
                    top_predictions=[
                        {"class": "Metal", "confidence": 0.9720},
                        {"class": "Plastic", "confidence": 0.0190},
                        {"class": "Miscellaneous Trash", "confidence": 0.0050},
                    ],
                    weight_kg=0.035,
                    destination_bin="Yellow Metal Bin",
                    is_verified=True,
                    verified_by="Sarah Jenkins",
                    notes="Aluminum soda can clean and depressurized.",
                    created_at=now - timedelta(hours=2, minutes=15),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="olive_oil_glass_jar.png",
                    image_url="/samples/glass.jpg",
                    predicted_class="Glass",
                    confidence=0.9510,
                    confidence_percentage=95.10,
                    top_predictions=[
                        {"class": "Glass", "confidence": 0.9510},
                        {"class": "Plastic", "confidence": 0.0350},
                        {"class": "Miscellaneous Trash", "confidence": 0.0120},
                    ],
                    weight_kg=0.310,
                    destination_bin="Teal Glass Bin",
                    is_verified=False,
                    created_at=now - timedelta(hours=5),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="yard_hedge_clippings.jpg",
                    image_url="/samples/vegetation.jpg",
                    predicted_class="Vegetation",
                    confidence=0.9805,
                    confidence_percentage=98.05,
                    top_predictions=[
                        {"class": "Vegetation", "confidence": 0.9805},
                        {"class": "Food Organics", "confidence": 0.0150},
                        {"class": "Cardboard", "confidence": 0.0030},
                    ],
                    weight_kg=0.450,
                    destination_bin="Green Yard Waste Bin",
                    is_verified=True,
                    verified_by="Sarah Jenkins",
                    notes="Municipal park branch clippings.",
                    created_at=now - timedelta(days=1, hours=2),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="office_documents_shredded.jpg",
                    image_url="/samples/paper.jpg",
                    predicted_class="Paper",
                    confidence=0.9120,
                    confidence_percentage=91.20,
                    top_predictions=[
                        {"class": "Paper", "confidence": 0.9120},
                        {"class": "Cardboard", "confidence": 0.0710},
                        {"class": "Miscellaneous Trash", "confidence": 0.0120},
                    ],
                    weight_kg=0.150,
                    destination_bin="Blue Paper Bin",
                    is_verified=False,
                    created_at=now - timedelta(days=2, hours=3),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="worn_cotton_tshirt.jpg",
                    image_url="/samples/textile_trash.jpg",
                    predicted_class="Textile Trash",
                    confidence=0.8840,
                    confidence_percentage=88.40,
                    top_predictions=[
                        {"class": "Textile Trash", "confidence": 0.8840},
                        {"class": "Miscellaneous Trash", "confidence": 0.0920},
                        {"class": "Paper", "confidence": 0.0180},
                    ],
                    weight_kg=0.200,
                    destination_bin="Purple Textile Depot",
                    is_verified=True,
                    verified_by="System Administrator",
                    notes="Apparel reclamation stream.",
                    created_at=now - timedelta(days=3, hours=5),
                ),
                Scan(
                    id=str(uuid.uuid4()),
                    user_id=admin_user_id,
                    filename="composite_chip_bag.jpg",
                    image_url="/samples/miscellaneous_trash.jpg",
                    predicted_class="Miscellaneous Trash",
                    confidence=0.8260,
                    confidence_percentage=82.60,
                    top_predictions=[
                        {"class": "Miscellaneous Trash", "confidence": 0.8260},
                        {"class": "Plastic", "confidence": 0.1410},
                        {"class": "Metal", "confidence": 0.0250},
                    ],
                    weight_kg=0.025,
                    destination_bin="Grey Landfill Bin",
                    is_verified=False,
                    created_at=now - timedelta(days=4, hours=1),
                ),
            ]
            db.add_all(initial_scans)
            db.commit()
            logger.info(f"Seeded {len(initial_scans)} initial scan records.")
