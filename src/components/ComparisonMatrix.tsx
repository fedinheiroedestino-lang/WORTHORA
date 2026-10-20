import React from 'react';
import { Check, Trophy, ExternalLink, ShoppingCart } from 'lucide-react';
import { ComparisonMatrixRow, ProductItem } from '../types';

interface ComparisonMatrixProps {
  products: ProductItem[];
  matrix: ComparisonMatrixRow[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ products, matrix }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="my-10 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 bg-stone-50/80 border-b border-stone-200">
        <h3 className="text-lg sm:text-xl font-black text-stone-900">
          Head-to-Head Specification Matrix
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Direct lab comparison measurements across primary performance and durability benchmarks.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          {/* Table Header: Product Profiles */}
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50">
              <th className="p-4 sm:p-5 w-1/4 text-xs font-bold uppercase tracking-wider text-stone-600">
                Evaluation Metric
              </th>
              {products.map((prod, idx) => (
                <th key={prod.id || idx} className="p-4 sm:p-5 text-center align-top">
                  <div className="flex flex-col items-center space-y-2">
                    {prod.isWinner ? (
                      <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <Trophy className="w-3 h-3" />
                        Shootout Winner
                      </span>
                    ) : (
                      <span className="bg-stone-200 text-stone-700 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        Contender
                      </span>
                    )}

                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-stone-200 bg-white shadow-xs"
                    />

                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 max-w-[200px]">
                      {prod.name}
                    </h4>

                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-extrabold text-stone-900">
                        ${prod.price.toFixed(2)}
                      </span>
                      {prod.originalPrice && (
                        <span className="text-xs text-stone-600 line-through">
                          ${prod.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: Specs & Values */}
          <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
            {matrix.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}>
                <td className="p-4 sm:p-5 font-bold text-stone-800 border-r border-stone-100">
                  {row.feature}
                </td>
                {products.map((_, prodIdx) => {
                  const val = row.values[prodIdx] || '—';
                  const isRowWinner = row.winnerIndex === prodIdx;

                  return (
                    <td 
                      key={prodIdx} 
                      className={`p-4 sm:p-5 text-center ${
                        isRowWinner ? 'bg-amber-50/40 font-semibold text-stone-900' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {isRowWinner && (
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                        <span>{val}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* Table Footer: Direct CTA Purchase Buttons */}
          <tfoot>
            <tr className="bg-stone-50 border-t-2 border-stone-200">
              <td className="p-4 sm:p-5 text-xs font-bold text-stone-600 uppercase tracking-wider">
                Direct Retailer Link
              </td>
              {products.map((prod, idx) => (
                <td key={idx} className="p-4 sm:p-5 text-center">
                  <a
                    href={prod.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className={`inline-flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-xs w-full max-w-[200px] ${
                      prod.isWinner
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>View Deal ({prod.buyRetailer})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
