import React from 'react';
import { WASTE_CATEGORIES } from '../../design-system/tokens';
import Badge from '../../design-system/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../design-system/Card';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export const SupportedCategoriesGrid = ({ onCategoryClick }) => {
  const categoryKeys = Object.keys(WASTE_CATEGORIES);

  return (
    <Card>
      <CardHeader
        action={
          <Badge variant="forest" size="sm">
            9 Supported Categories
          </Badge>
        }
      >
        <CardTitle className="flex items-center gap-2">
          <Layers size={18} className="text-forest-700" />
          Supported Waste Categories
        </CardTitle>
        <CardDescription>
          Multi-class optical segmentation trained to identify municipal recyclables, compostables, and residual waste
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categoryKeys.map((key) => {
            const cat = WASTE_CATEGORIES[key];
            return (
              <div
                key={key}
                onClick={() => onCategoryClick && onCategoryClick(cat)}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-forest-400/80 bg-white hover:bg-forest-50/20 transition-all duration-150 flex flex-col justify-between cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs ring-2 ring-white"
                        style={{ backgroundColor: cat.binColor }}
                      />
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-forest-900 transition-colors">
                        {cat.name}
                      </h4>
                    </div>
                    <Badge variant={cat.recyclabilityType} size="xs">
                      {cat.recyclability}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Bin Target:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                    {cat.binName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportedCategoriesGrid;
