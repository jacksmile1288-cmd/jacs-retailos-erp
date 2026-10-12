import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, RecipeItem, FBMenuCosting } from '../../types';
import { INITIAL_RAW_INGREDIENTS } from '../../data/rawIngredientsData';
import { FNB_PRODUCTS } from '../../data/fnbData';
import {
  UtensilsCrossed,
  Calculator,
  Plus,
  Trash2,
  X,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  Flame,
  Coffee,
  Check,
  Percent,
} from 'lucide-react';

interface FBMasterModuleProps {
  onBackToOverview?: () => void;
}

export const FBMasterModule: React.FC<FBMasterModuleProps> = ({ onBackToOverview }) => {
  const {
    products,
    addProduct,
    calculateFBMenuHPP,
    handleSaveRecipeCosting,
    theme,
    language,
    showToast,
  } = useApp();

  const isLight = theme === 'light';
  const isEn = language === 'en';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedMenu, setSelectedMenu] = useState<Product | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Sub-modal Input Bahan Baku Baru ke Gudang
  const [isNewIngredientModalOpen, setIsNewIngredientModalOpen] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('gr');
  const [newIngCost, setNewIngCost] = useState<number | ''>('');
  const [newIngStock, setNewIngStock] = useState<number | ''>(1000);
  const [newIngMinStock, setNewIngMinStock] = useState<number | ''>(200);

  // Bahan mentah baru yang didaftarkan langsung di sesi aktif
  const [customRawMaterials, setCustomRawMaterials] = useState<
    Array<{ id: string; name: string; unit: string; costPerUnit: number; stock: number }>
  >([]);

  // Filter list of F&B menus
  const fnbMenus = useMemo(() => {
    // Collect from products state that are MENU_FB or businessModel === 'fnb'
    const fromState = products.filter(
      (p) =>
        p.itemType === 'MENU_FB' ||
        p.businessModel === 'fnb' ||
        (p.id || '').startsWith('FNB-')
    );

    // Fallback merge with FNB_PRODUCTS if some are missing
    const seenIds = new Set(fromState.map((p) => p.id));
    const merged = [...fromState];
    FNB_PRODUCTS.forEach((fp) => {
      if (!seenIds.has(fp.id)) {
        merged.push(fp);
      }
    });

    return merged
      .filter((p) => {
        // Exclude raw materials strictly
        if (p.itemType === 'RAW_MATERIAL') return false;
        const idLower = (p.id || '').toLowerCase();
        if (idLower.startsWith('ing-') || idLower.startsWith('raw-')) return false;
        const catLower = (p.category || '').toLowerCase();
        if (catLower.includes('bahan baku') || catLower.includes('bahan mentah')) return false;

        const matchSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat =
          categoryFilter === 'ALL' || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());

        return matchSearch && matchCat;
      })
      .map((menu): Product => {
        // Koreksi Data Default Resep FNB-001 (Nasi Goreng Wagyu)
        // Perbaiki jika baris pertama keliru (Telur 150 pcs Rp 300.000 -> Beras Putih Pandan Wangi 150 gr Rp 2.250)
        if (menu.id === 'FNB-001' || menu.name.toLowerCase().includes('nasi goreng wagyu')) {
          const currentRecipe = menu.costing?.recipe || (menu.recipe as any[]) || [];
          const hasWrongTelur = currentRecipe.some(
            (r: any) =>
              (r.ingredientId === 'ING-004' || (r.name || r.ingredientName || '').toLowerCase().includes('telur')) &&
              (r.portionQty === 150 || r.qty === 150)
          );

          if (hasWrongTelur || !menu.costing || (menu.costing?.rawMaterialHPP ?? 0) > 100000) {
            const correctedRecipe: RecipeItem[] = [
              { ingredientId: 'ING-001', ingredientName: 'Beras Putih Pandan Wangi', portionQty: 150, unit: 'gr', costPerUnit: 15, subtotalCost: 2250 },
              { ingredientId: 'ING-002', ingredientName: 'Daging Sapi Wagyu Slice', portionQty: 80, unit: 'gr', costPerUnit: 180, subtotalCost: 14400 },
              { ingredientId: 'ING-004', ingredientName: 'Telur Ayam Negeri', portionQty: 1, unit: 'pcs', costPerUnit: 2000, subtotalCost: 2000 },
              { ingredientId: 'ING-005', ingredientName: 'Bumbu Racik Rempah Spesial', portionQty: 1, unit: 'porsi', costPerUnit: 3500, subtotalCost: 3500 },
              { ingredientId: 'ING-006', ingredientName: 'Minyak Goreng Sawit', portionQty: 25, unit: 'ml', costPerUnit: 18, subtotalCost: 450 },
            ];
            const opCost = menu.costing?.operationalCost ?? menu.packagingCost ?? 1500;
            const targetMargin = menu.costing?.targetMarginPercent ?? 45;
            const waste = menu.costing?.wastePercentage ?? menu.wastePercent ?? 5;
            const calculatedCosting = calculateFBMenuHPP(correctedRecipe, opCost, targetMargin, waste);
            const recipeForProduct = correctedRecipe.map((r) => ({
              ingredientId: r.ingredientId,
              name: r.ingredientName,
              ingredientName: r.ingredientName,
              qty: r.portionQty,
              portionQty: r.portionQty,
              unit: r.unit,
              costPerUnit: r.costPerUnit,
              subtotalCost: r.subtotalCost,
            }));

            return {
              ...menu,
              recipe: recipeForProduct,
              costing: calculatedCosting,
              cost_price: calculatedCosting.totalCost ?? 25230,
            };
          }
        }
        return {
          ...menu,
          cost_price: menu.cost_price ?? 0,
        };
      });
  }, [products, searchQuery, categoryFilter, calculateFBMenuHPP]);

  // Categories present in F&B menus
  const fnbCategories = useMemo(() => {
    const cats = new Set<string>();
    fnbMenus.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, [fnbMenus]);

  // Master available raw ingredients pool for BOM selector
  const availableRawMaterials = useMemo(() => {
    const rawFromProducts = products
      .filter(
        (p) =>
          p.itemType === 'RAW_MATERIAL' ||
          (p.id || '').toLowerCase().startsWith('ing-') ||
          (p.id || '').toLowerCase().startsWith('raw-') ||
          (p.category || '').toLowerCase().includes('bahan baku') ||
          (p.category || '').toLowerCase().includes('bahan mentah')
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit || 'gr',
        costPerUnit: p.cost_price || p.sell_price || 10,
        stock: p.stock || 0,
      }));

    const rawFromInitial = INITIAL_RAW_INGREDIENTS.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      costPerUnit: ing.costPerUnit,
      stock: ing.currentStock,
    }));

    const combinedMap = new Map<string, { id: string; name: string; unit: string; costPerUnit: number; stock: number }>();
    rawFromInitial.forEach((r) => combinedMap.set(r.id, r));
    rawFromProducts.forEach((r) => combinedMap.set(r.id, r));
    customRawMaterials.forEach((r) => combinedMap.set(r.id, r));

    return Array.from(combinedMap.values());
  }, [products, customRawMaterials]);

  // Modal Calculator Form State
  const [modalRecipe, setModalRecipe] = useState<RecipeItem[]>([]);
  const [modalOperationalCost, setModalOperationalCost] = useState<number>(3500);
  const [modalTargetMargin, setModalTargetMargin] = useState<number>(60);
  const [modalWastePercentage, setModalWastePercentage] = useState<number>(5);

  // Open Calculator Modal for a menu
  const handleOpenCalculator = (menu: Product) => {
    setSelectedMenu(menu);

    // Initialize recipe from menu's existing recipe or costing
    let existingRecipe: RecipeItem[] = (menu.costing?.recipe && menu.costing.recipe.length > 0)
      ? menu.costing.recipe
      : (menu.recipe && menu.recipe.length > 0)
      ? menu.recipe.map((r: any) => ({
          ingredientId: r.ingredientId,
          ingredientName: r.ingredientName || r.name || 'Bahan',
          portionQty: r.portionQty ?? r.qty ?? 100,
          unit: r.unit || 'gr',
          costPerUnit: r.costPerUnit || 15,
          subtotalCost: r.subtotalCost ?? ((r.portionQty ?? r.qty ?? 100) * (r.costPerUnit || 15)),
        }))
      : [];

    // Koreksi Data Default Resep FNB-001 (Nasi Goreng Wagyu)
    // Perbaiki baris pertama yang salah input: ganti "Telur Ayam Negeri 150 pcs (Rp 300.000)" menjadi "Beras Putih Pandan Wangi 150 gr (Rp 15/gr = Rp 2.250)"
    if (menu.id === 'FNB-001' || menu.name.toLowerCase().includes('nasi goreng wagyu')) {
      const hasWrongTelur = existingRecipe.some(
        (r) =>
          (r.ingredientId === 'ING-004' || r.ingredientName.toLowerCase().includes('telur')) &&
          r.portionQty === 150
      );
      if (hasWrongTelur || existingRecipe.length === 0) {
        existingRecipe = [
          { ingredientId: 'ING-001', ingredientName: 'Beras Putih Pandan Wangi', portionQty: 150, unit: 'gr', costPerUnit: 15, subtotalCost: 2250 },
          { ingredientId: 'ING-002', ingredientName: 'Daging Sapi Wagyu Slice', portionQty: 80, unit: 'gr', costPerUnit: 180, subtotalCost: 14400 },
          { ingredientId: 'ING-004', ingredientName: 'Telur Ayam Negeri', portionQty: 1, unit: 'pcs', costPerUnit: 2000, subtotalCost: 2000 },
          { ingredientId: 'ING-005', ingredientName: 'Bumbu Racik Rempah Spesial', portionQty: 1, unit: 'porsi', costPerUnit: 3500, subtotalCost: 3500 },
          { ingredientId: 'ING-006', ingredientName: 'Minyak Goreng Sawit', portionQty: 25, unit: 'ml', costPerUnit: 18, subtotalCost: 450 },
        ];
      } else {
        existingRecipe = existingRecipe.map((item) => {
          if ((item.ingredientId === 'ING-004' || item.ingredientName.toLowerCase().includes('telur')) && item.portionQty === 150) {
            return {
              ingredientId: 'ING-001',
              ingredientName: 'Beras Putih Pandan Wangi',
              portionQty: 150,
              unit: 'gr',
              costPerUnit: 15,
              subtotalCost: 2250,
            };
          }
          return item;
        });
      }
    }

    if (existingRecipe.length > 0) {
      setModalRecipe(existingRecipe);
    } else {
      // Default sample starter ingredients for convenience
      const defaultRaw = availableRawMaterials.slice(0, 3).map((raw) => ({
        ingredientId: raw.id,
        ingredientName: raw.name,
        portionQty: raw.unit === 'pcs' ? 1 : 100,
        unit: raw.unit,
        costPerUnit: raw.costPerUnit,
        subtotalCost: (raw.unit === 'pcs' ? 1 : 100) * raw.costPerUnit,
      }));
      setModalRecipe(defaultRaw);
    }

    setModalOperationalCost(menu.costing?.operationalCost ?? menu.packagingCost ?? 3500);
    setModalTargetMargin(menu.costing?.targetMarginPercent ?? 60);
    setModalWastePercentage(menu.costing?.wastePercentage ?? menu.wastePercent ?? 5);
    setIsCalculatorOpen(true);
  };

  // 1. Fungsikan Tombol [+ Tambah Komponen Bahan]:
  // Saat diklik, tambahkan 1 baris baru dengan default:
  // { ingredientId: '', ingredientName: '', portionQty: 1, unit: 'gr', costPerUnit: 0, subtotalCost: 0 }
  const handleAddIngredientRow = () => {
    setModalRecipe((prev) => [
      ...prev,
      {
        ingredientId: '',
        ingredientName: '',
        portionQty: 1,
        unit: 'gr',
        costPerUnit: 0,
        subtotalCost: 0,
      },
    ]);
  };

  // Update ingredient row:
  // Saat user memilih bahan dari dropdown, otomatis isi kolom satuan (unit), harga modal (costPerUnit),
  // dan hitung subtotalModal = portionQty * costPerUnit
  const handleUpdateIngredient = (index: number, updates: Partial<RecipeItem>) => {
    setModalRecipe((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...updates };

      if (updates.ingredientId !== undefined) {
        if (!updates.ingredientId) {
          current.ingredientId = '';
          current.ingredientName = '';
          current.unit = 'gr';
          current.costPerUnit = 0;
          current.subtotalCost = 0;
        } else {
          const matched = availableRawMaterials.find((r) => r.id === updates.ingredientId);
          if (matched) {
            current.ingredientName = matched.name;
            current.unit = matched.unit || 'gr';
            current.costPerUnit = matched.costPerUnit || 0;
          }
        }
      }

      const portion = typeof current.portionQty === 'number' ? current.portionQty : Number(current.portionQty) || 0;
      const cost = typeof current.costPerUnit === 'number' ? current.costPerUnit : Number(current.costPerUnit) || 0;
      current.subtotalCost = Math.round(portion * cost);
      next[index] = current;
      return next;
    });
  };

  // 2. Tambahkan Fitur [+ Input Bahan Baku Baru ke Gudang]
  const handleSaveNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newIngName.trim();
    if (!trimmedName) {
      showToast('Nama bahan mentah wajib diisi!');
      return;
    }
    const cost = Number(newIngCost) || 0;
    if (cost <= 0) {
      showToast('Harga beli modal per satuan harus lebih besar dari 0!');
      return;
    }
    const stockVal = Number(newIngStock) || 0;
    const minStockVal = Number(newIngMinStock) || 0;
    const newId = `ING-${Date.now().toString().slice(-4)}`;

    const newRawItem = {
      id: newId,
      name: trimmedName,
      unit: newIngUnit,
      costPerUnit: cost,
      stock: stockVal,
    };

    setCustomRawMaterials((prev) => [newRawItem, ...prev]);

    // Daftarkan ke database gudang AppContext
    addProduct({
      name: trimmedName,
      brand: 'Dapur & Gudang',
      category: 'Bahan Baku & Mentah',
      itemType: 'RAW_MATERIAL',
      unit: newIngUnit,
      cost_price: cost,
      sell_price: cost,
      stock: stockVal,
      min_stock: minStockVal,
      status: 'Active',
      businessModel: 'fnb',
      plu: newId,
      barcode: `ING${Date.now().toString().slice(-6)}`,
    });

    // Otomatis pasangkan bahan baru ini ke baris resep BOM
    setModalRecipe((prev) => {
      const emptyRowIndex = prev.findIndex((r) => !r.ingredientId);
      if (emptyRowIndex !== -1) {
        const next = [...prev];
        const currentPortion = next[emptyRowIndex].portionQty || (newIngUnit === 'pcs' ? 1 : 50);
        next[emptyRowIndex] = {
          ingredientId: newId,
          ingredientName: trimmedName,
          portionQty: currentPortion,
          unit: newIngUnit,
          costPerUnit: cost,
          subtotalCost: Math.round(currentPortion * cost),
        };
        return next;
      }
      return [
        ...prev,
        {
          ingredientId: newId,
          ingredientName: trimmedName,
          portionQty: newIngUnit === 'pcs' ? 1 : 50,
          unit: newIngUnit,
          costPerUnit: cost,
          subtotalCost: Math.round((newIngUnit === 'pcs' ? 1 : 50) * cost),
        },
      ];
    });

    showToast(`Bahan baku "${trimmedName}" berhasil didaftarkan ke gudang!`);
    setNewIngName('');
    setNewIngCost('');
    setNewIngStock(1000);
    setNewIngMinStock(200);
    setIsNewIngredientModalOpen(false);
  };

  // Remove ingredient row
  const handleRemoveIngredientRow = (index: number) => {
    setModalRecipe((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Live HPP & Selling Price Calculation
  const liveCosting: FBMenuCosting = useMemo(() => {
    return calculateFBMenuHPP(
      modalRecipe,
      modalOperationalCost,
      modalTargetMargin,
      modalWastePercentage
    );
  }, [calculateFBMenuHPP, modalRecipe, modalOperationalCost, modalTargetMargin, modalWastePercentage]);

  // Nominal Profit per portion
  const liveProfitNominal = Math.max(
    0,
    (liveCosting.calculatedSellingPrice || 0) - (liveCosting.totalCost || 0)
  );

  // Save handler
  const handleSaveCosting = (updatePOSPrice: boolean) => {
    if (!selectedMenu) return;

    if (modalRecipe.length === 0) {
      showToast('Masukkan minimal 1 bahan baku ke dalam skema resep BOM!');
      return;
    }

    handleSaveRecipeCosting(selectedMenu.id, liveCosting, updatePOSPrice);
    setIsCalculatorOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner / Header */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 flex items-center justify-center font-black">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Food & Beverage (F&B)
            </h2>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges (Border 3D Neon Solid in Dark, Clean Thin Border in Light) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
          isLight
            ? 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
            : 'border-2 border-cyan-400/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
            isLight
              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
              : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
          }`}>
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">Total Menu F&B</span>
            <span className={`text-lg font-black font-mono ${isLight ? 'text-cyan-800' : 'text-cyan-400'}`}>{fnbMenus.length} Menu</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
          isLight
            ? 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
            : 'border-2 border-emerald-400/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">Rata-rata Margin Laba</span>
            <span className={`text-lg font-black font-mono ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>45% - 60%</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
          isLight
            ? 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
            : 'border-2 border-amber-400/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(245,158,11,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
            isLight
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">Bahan Mentah Gudang</span>
            <span className={`text-lg font-black font-mono ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
              {availableRawMaterials.length} SKU Bahan
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl relative overflow-hidden flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
          isLight
            ? 'bg-white border border-slate-200 shadow-sm hover:border-slate-300'
            : 'border-2 border-rose-400/90 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5),0_0_20px_rgba(244,63,94,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
            isLight
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block font-medium">Faktor Susut Waste</span>
            <span className={`text-lg font-black font-mono ${isLight ? 'text-rose-800' : 'text-rose-400'}`}>Standar 5%</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#161b22] border-[#30363d]'
      }`}>
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama menu, minuman, atau SKU F&B..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border outline-none transition ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500' : 'bg-[#0d1117] border-[#30363d] text-white focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {fnbCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-500 text-black shadow-xs font-black'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-[#0d1117] hover:bg-[#21262d] text-gray-400 border border-[#30363d]'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono">
          Menampilkan <strong className="text-white font-black">{fnbMenus.length}</strong> menu
        </div>
      </div>

      {/* Tabel Daftar Menu F&B */}
      <div className={`rounded-2xl border overflow-hidden shadow-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-[#30363d]'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] font-black uppercase tracking-wider ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#0d1117] text-gray-400 border-[#30363d]'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Menu F&B</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3 text-center">Resep BOM</th>
                <th className="py-3.5 px-3 text-right">HPP Bahan (+5%)</th>
                <th className="py-3.5 px-3 text-right">Operasional</th>
                <th className="py-3.5 px-3 text-right">Total HPP</th>
                <th className="py-3.5 px-3 text-right">Harga POS (Kasir)</th>
                <th className="py-3.5 px-3 text-center">Margin Laba</th>
                <th className="py-3.5 px-4 text-center">Aksi Kalkulasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]/60">
              {fnbMenus.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <UtensilsCrossed className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-sm">Tidak ada menu F&B yang ditemukan</p>
                    <p className="text-xs text-gray-500 mt-0.5">Silakan ganti kata kunci pencarian atau filter kategori</p>
                  </td>
                </tr>
              ) : (
                fnbMenus.map((menu, idx) => {
                  const costing = menu.costing;
                  const recipeCount = costing?.recipe?.length ?? menu.recipe?.length ?? 0;
                  const rawHpp = costing?.rawMaterialHPP ?? costing?.rawMaterialCost ?? menu.cost_price ?? 0;
                  const opCost = costing?.operationalCost ?? menu.packagingCost ?? 0;
                  const totalCost = costing?.totalCost ?? (rawHpp + opCost);
                  const sellPrice = menu.sell_price || 0;
                  const marginPct = costing?.targetMarginPercent ?? (sellPrice > 0 ? Math.round(((sellPrice - totalCost) / sellPrice) * 100) : 0);

                  return (
                    <tr
                      key={menu.id || idx}
                      className={`transition ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1f242c]'
                      }`}
                    >
                      {/* Nama Menu & Foto */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-black/40 border border-slate-300 dark:border-gray-700 shrink-0 flex items-center justify-center">
                            {menu.image ? (
                              <img
                                src={menu.image}
                                alt={menu.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs block text-slate-900 dark:text-white line-clamp-1">
                              {menu.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                              ID: {menu.id} {menu.barcode ? `• Barcode: ${menu.barcode}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 dark:bg-black/30 border border-slate-300 dark:border-gray-700 text-slate-700 dark:text-gray-300">
                          {menu.category || 'F&B'}
                        </span>
                      </td>

                      {/* Resep BOM */}
                      <td className="py-3 px-3 text-center">
                        {recipeCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-[#0052FF] dark:text-[#58a6ff] border border-blue-500/30">
                            {recipeCount} Bahan BOM
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/10 text-slate-500 dark:text-gray-400 border border-gray-600/30">
                            Belum Dikonfigurasi
                          </span>
                        )}
                      </td>

                      {/* HPP Bahan Baku */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-gray-200">
                        Rp {rawHpp.toLocaleString('id-ID')}
                      </td>

                      {/* Biaya Operasional */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-gray-400">
                        Rp {opCost.toLocaleString('id-ID')}
                      </td>

                      {/* Total HPP */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-500">
                        Rp {totalCost.toLocaleString('id-ID')}
                      </td>

                      {/* Harga Jual Kasir */}
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        Rp {sellPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Margin Laba % */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                          marginPct >= 50
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : marginPct >= 30
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {marginPct}% Margin
                        </span>
                      </td>

                      {/* Tombol Aksi */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          id={`btn-atur-resep-${menu.id.toLowerCase()}`}
                          onClick={() => handleOpenCalculator(menu)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                          title="Buka Kalkulator HPP & Skema Resep BOM"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Atur Resep & HPP</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL KALKULATOR HPP & SKEMA RESEP BOM                                    */}
      {/* ========================================================================= */}
      {isCalculatorOpen && selectedMenu && (
        <div
          id="modal-kalkulator-hpp"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsCalculatorOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                    <span>Kalkulator HPP & Resep BOM:</span>
                    <span className="text-emerald-500">{selectedMenu.name}</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    ID: {selectedMenu.id} • Kategori: {selectedMenu.category} • Harga Kasir Saat Ini: <strong className="text-white">Rp {selectedMenu.sell_price.toLocaleString('id-ID')}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Tutup Modal [Esc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Bagian 1: Skema Bahan Baku Penyusun (BOM) */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-gray-200">
                      1. Skema Komposisi Bahan Baku (BOM / Takaran Porsi)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-tambah-komponen-bahan"
                      onClick={handleAddIngredientRow}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Komponen Bahan</span>
                    </button>
                    <button
                      type="button"
                      id="btn-buat-bahan-baku-baru"
                      onClick={() => setIsNewIngredientModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Bahan Baku Baru</span>
                    </button>
                  </div>
                </div>

                {/* Tabel Bahan Mentah */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b text-[10px] font-black uppercase text-gray-400 ${
                      isLight ? 'bg-slate-200/60' : 'bg-black/20'
                    }`}>
                      <tr>
                        <th className="py-2 px-2.5">Pilih Bahan Baku (Gudang)</th>
                        <th className="py-2 px-2 text-right w-28">Takaran (Porsi)</th>
                        <th className="py-2 px-2 text-center w-20">Satuan</th>
                        <th className="py-2 px-2 text-right w-28">Biaya / Unit</th>
                        <th className="py-2 px-2 text-right w-32">Subtotal Modal</th>
                        <th className="py-2 px-2 text-center w-12">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                      {modalRecipe.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-gray-400">
                            Belum ada bahan mentah dalam resep. Klik "+ Tambah Komponen Bahan" untuk menambahkan.
                          </td>
                        </tr>
                      ) : (
                        modalRecipe.map((row, rIdx) => (
                          <tr key={`recipe-row-${rIdx}`} className="hover:bg-black/10">
                            {/* Dropdown Bahan Baku */}
                            <td className="py-2 px-2">
                              <select
                                value={row.ingredientId || ''}
                                onChange={(e) => handleUpdateIngredient(rIdx, { ingredientId: e.target.value })}
                                className={`w-full py-1.5 px-2 rounded-lg text-xs border font-medium outline-none cursor-pointer ${
                                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
                                } ${!row.ingredientId ? 'border-amber-500/70 text-amber-500 font-bold' : ''}`}
                              >
                                <option value="">-- Pilih Bahan Baku dari Gudang --</option>
                                {availableRawMaterials.map((raw, rawIdx) => (
                                  <option key={`raw-mat-opt-${raw.id}-${rawIdx}`} value={raw.id}>
                                    {raw.name} ({raw.unit}) - Rp {raw.costPerUnit.toLocaleString('id-ID')}/{raw.unit}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Takaran Porsi */}
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={row.portionQty === 0 ? '' : row.portionQty}
                                onChange={(e) => handleUpdateIngredient(rIdx, { portionQty: Number(e.target.value) || 0 })}
                                placeholder="1"
                                className={`w-full py-1.5 px-2 rounded-lg text-right font-mono font-bold text-xs border outline-none ${
                                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
                                }`}
                              />
                            </td>

                            {/* Satuan */}
                            <td className="py-2 px-2 text-center text-gray-400 font-mono">
                              {row.ingredientId ? row.unit : '-'}
                            </td>

                            {/* Biaya per unit */}
                            <td className="py-2 px-2 text-right font-mono text-gray-400">
                              {row.ingredientId ? `Rp ${row.costPerUnit.toLocaleString('id-ID')}` : 'Rp 0'}
                            </td>

                            {/* Subtotal Biaya */}
                            <td className="py-2 px-2 text-right font-mono font-black text-slate-900 dark:text-emerald-400">
                              Rp {row.subtotalCost.toLocaleString('id-ID')}
                            </td>

                            {/* Tombol Hapus */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveIngredientRow(rIdx)}
                                className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                                title="Hapus bahan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Bahan & Waste Factor */}
                <div className="pt-2 border-t border-slate-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Faktor Susut Bahan (Waste %):</span>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={modalWastePercentage}
                      onChange={(e) => setModalWastePercentage(Number(e.target.value) || 0)}
                      className={`w-16 py-1 px-2 text-right font-mono font-bold rounded-lg border outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
                      }`}
                    />
                    <span className="text-gray-400 font-bold">% (Standar 5% bahan sisa/olahan)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">
                      HPP Bahan Baku Murni + {modalWastePercentage}% Waste:
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-500">
                      Rp {liveCosting.rawMaterialHPP?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bagian 2 & 3: Biaya Operasional & Target Margin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Biaya Operasional */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-gray-200">
                      2. Biaya Operasional & Kemasan / Porsi
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Alokasi biaya gas memasak, listrik, air, packaging (lunch box, bowl, sedotan), dan tenaga kerja dapur.
                  </p>
                  <div className="relative pt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={modalOperationalCost || ''}
                      onChange={(e) => setModalOperationalCost(Number(e.target.value) || 0)}
                      className={`w-full py-2 pl-10 pr-3 rounded-xl font-mono font-black text-sm border outline-none ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-500' : 'bg-[#161b22] border-[#30363d] text-white focus:border-amber-500'
                      }`}
                      placeholder="3500"
                    />
                  </div>
                </div>

                {/* 3. Target Margin Laba */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-gray-200">
                      3. Target Margin Laba Bersih / Kotor (%)
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Persentase margin keuntungan dari harga jual. Standar industri resto/cafe: 50% - 65%.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="10"
                      max="85"
                      step="5"
                      value={modalTargetMargin}
                      onChange={(e) => setModalTargetMargin(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="1"
                        max="95"
                        value={modalTargetMargin}
                        onChange={(e) => setModalTargetMargin(Number(e.target.value) || 0)}
                        className={`w-full py-1.5 px-2 text-right font-mono font-black rounded-lg border outline-none text-sm ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
                        }`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-gray-400 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 4: Live Card Kalkulasi HPP & Rekomendasi Harga Jual Kasir */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-black/60 border border-emerald-500/40 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className="font-black text-sm uppercase tracking-wide text-white">
                      Hasil Kalkulasi Otomatis HPP & Rekomendasi Harga Jual
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px]">
                    Formula ERP: (Total HPP) / (1 - Margin%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">HPP Bahan Baku (+5%)</span>
                    <span className="font-mono font-bold text-sm text-gray-200">
                      Rp {liveCosting.rawMaterialHPP?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Biaya Operasional</span>
                    <span className="font-mono font-bold text-sm text-amber-400">
                      Rp {liveCosting.operationalCost?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Total Beban Pokok (HPP)</span>
                    <span className="font-mono font-black text-sm text-rose-400">
                      Rp {liveCosting.totalCost?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 uppercase font-extrabold block mb-1">Laba Bersih / Porsi</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      +Rp {liveProfitNominal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Highlight Harga Jual POS */}
                <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-gray-300 block font-medium">
                      Rekomendasi Harga Jual Kasir Baru (Target {modalTargetMargin}% Margin):
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
                      Rp {liveCosting.calculatedSellingPrice?.toLocaleString('id-ID') || 0}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 block">Harga POS Kasir Saat Ini:</span>
                    <span className="text-sm font-mono font-bold text-gray-300 line-through">
                      Rp {selectedMenu.sell_price.toLocaleString('id-ID')}
                    </span>
                    {selectedMenu.sell_price !== liveCosting.calculatedSellingPrice && (
                      <span className="text-[11px] text-emerald-400 block font-bold">
                        Selisih: Rp {((liveCosting.calculatedSellingPrice || 0) - selectedMenu.sell_price).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
            }`}>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-simpan-resep-saja"
                  onClick={() => handleSaveCosting(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-gray-700'
                  }`}
                  title="Simpan resep BOM & kalkulasi HPP tanpa mengubah harga aktif di kasir POS"
                >
                  Simpan Resep Saja (Harga POS Tetap)
                </button>

                <button
                  type="button"
                  id="btn-simpan-terapkan-harga-kasir"
                  onClick={() => handleSaveCosting(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Simpan resep & otomatis update harga jual di kasir POS sesuai kalkulasi HPP"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Terapkan ke Harga Menu Kasir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL INPUT BAHAN BAKU BARU KE GUDANG                                 */}
      {/* ========================================================================= */}
      {isNewIngredientModalOpen && (
        <div
          id="modal-input-bahan-baku-baru"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsNewIngredientModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#161b22] border-[#30363d] text-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d1117] border-[#30363d]'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Input Bahan Baku Baru ke Gudang</h3>
                  <p className="text-[11px] text-gray-400">Daftarkan bahan mentah baru ke database master F&B</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewIngredientModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewIngredient} className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Nama Bahan Mentah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  placeholder="Contoh: Saus Tiram, Garam Halus, Bawang Putih..."
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold outline-none transition ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      : 'bg-[#0d1117] border-[#30363d] text-white focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Satuan Standar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  >
                    <option value="gr">gr (Gram)</option>
                    <option value="ml">ml (Mililiter)</option>
                    <option value="pcs">pcs (Pieces / Butir)</option>
                    <option value="porsi">porsi (Porsi)</option>
                    <option value="sachet">sachet (Sachet)</option>
                    <option value="lembar">lembar (Lembar)</option>
                    <option value="sdm">sdm (Sendok Makan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Harga Modal / Satuan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-gray-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      value={newIngCost === '' ? '' : newIngCost}
                      onChange={(e) => setNewIngCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Contoh: 15 / gr"
                      className={`w-full py-2 pl-9 pr-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                          : 'bg-[#0d1117] border-[#30363d] text-white focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Stok Awal Gudang
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newIngStock === '' ? '' : newIngStock}
                    onChange={(e) => setNewIngStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-semibold outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Stok Minimum (Alert)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newIngMinStock === '' ? '' : newIngMinStock}
                    onChange={(e) => setNewIngMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-mono font-semibold outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <span>
                  Bahan baru ini otomatis berstatus <strong>RAW_MATERIAL</strong> dan akan langsung muncul di dropdown pilihan resep BOM menu kasir tanpa dapat dijual eceran di POS.
                </span>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIngredientModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-bahan-mentah"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan ke Gudang & Pakai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
