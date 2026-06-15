import { useState, useMemo } from 'react';
import {
  Palette,
  Zap,
  Home,
  Check,
  GripVertical,
  Plus,
  X,
  Calculator,
  Package,
  BarChart3,
  Tag,
  Settings as SettingsIcon,
  Users,
  ClipboardList,
  Receipt,
  Save,
  Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { themes, availableQuickActions } from '@/data/mockData';
import { useStoreConfig } from '@/stores/useStoreConfig';
import { cn } from '@/lib/utils';
import type { QuickAction } from '@/types';

const actionIconMap: Record<string, LucideIcon> = {
  Zap,
  Package,
  BarChart3,
  Tag,
  Settings: SettingsIcon,
  Users,
  ClipboardList,
  Receipt,
  Calculator,
};

const homepageOptions = [
  { id: '/cashier', label: '收银台', icon: Calculator },
  { id: '/inventory', label: '库存管理', icon: Package },
  { id: '/promotion', label: '促销管理', icon: Tag },
  { id: '/dashboard', label: '店长看板', icon: BarChart3 },
  { id: '/settings', label: '门店配置', icon: SettingsIcon },
];

function SortableActionItem({
  action,
  onRemove,
}: {
  action: QuickAction;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = actionIconMap[action.icon] || Zap;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 transition-shadow',
        isDragging && 'shadow-xl z-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 text-sm font-medium text-slate-700">{action.label}</div>
      <button
        onClick={() => onRemove(action.id)}
        className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Settings() {
  const themeId = useStoreConfig((state) => state.themeId);
  const setTheme = useStoreConfig((state) => state.setTheme);
  const quickActions = useStoreConfig((state) => state.quickActions);
  const setQuickActions = useStoreConfig((state) => state.setQuickActions);
  const defaultHomepage = useStoreConfig((state) => state.defaultHomepage);
  const setDefaultHomepage = useStoreConfig((state) => state.setDefaultHomepage);
  const storeName = useStoreConfig((state) => state.storeName);
  const setStoreName = useStoreConfig((state) => state.setStoreName);

  const [selectedTheme, setSelectedTheme] = useState(themeId);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(storeName);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const availableToAdd = useMemo(() => {
    const selectedIds = new Set(quickActions.map((a) => a.id));
    return availableQuickActions.filter((a) => !selectedIds.has(a.id));
  }, [quickActions]);

  const handleThemeSelect = (id: string) => {
    setSelectedTheme(id);
    setTheme(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = quickActions.findIndex((a) => a.id === active.id);
      const newIndex = quickActions.findIndex((a) => a.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newActions = arrayMove(quickActions, oldIndex, newIndex).map((a, i) => ({
          ...a,
          order: i + 1,
        }));
        setQuickActions(newActions);
      }
    }
  };

  const handleAddAction = (action: QuickAction) => {
    const newActions = [...quickActions, { ...action, order: quickActions.length + 1 }];
    setQuickActions(newActions);
  };

  const handleRemoveAction = (id: string) => {
    const filtered = quickActions
      .filter((a) => a.id !== id)
      .map((a, i) => ({ ...a, order: i + 1 }));
    setQuickActions(filtered);
  };

  const handleSaveName = () => {
    setStoreName(tempName);
    setEditingName(false);
  };

  return (
    <div className="h-full flex flex-col p-5 gap-5 overflow-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800 mb-1">门店配置中心</h1>
        <p className="text-sm text-slate-500">自定义门店主题、快捷动作和默认首页设置</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">门店信息</h2>
              <p className="text-xs text-slate-500">门店基础信息设置</p>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">门店名称</label>
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    保存
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100"
                  onClick={() => setEditingName(true)}
                >
                  <span className="text-sm text-slate-700">{storeName}</span>
                  <span className="text-xs text-slate-400">点击编辑</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Home className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">默认首页</h2>
              <p className="text-xs text-slate-500">登录后默认跳转的页面</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {homepageOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = defaultHomepage === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setDefaultHomepage(opt.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      selected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        selected ? 'text-primary' : 'text-slate-700'
                      )}
                    >
                      {opt.label}
                    </div>
                  </div>
                  {selected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">主题风格</h2>
            <p className="text-xs text-slate-500">
              选择门店专属的视觉风格，不同门店可设置不同主题
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={cn(
                  'relative rounded-2xl overflow-hidden border-2 transition-all text-left',
                  isSelected ? 'border-primary shadow-lg' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <div className="h-20 relative" style={{ backgroundColor: theme.colors.primary }}>
                  <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                    <div className="w-1/3 h-full" style={{ backgroundColor: theme.colors.sidebarBg }} />
                    <div className="flex-1 h-full" style={{ backgroundColor: theme.colors.headerBg }} />
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <div className="text-sm font-semibold text-slate-800">{theme.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{theme.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">已选快捷动作</h2>
              <p className="text-xs text-slate-500">拖拽调整顺序，顶部栏从左到右显示</p>
            </div>
          </div>

          <div className="flex-1">
            {quickActions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                <Zap className="w-10 h-10 mb-2 opacity-30" />
                从右侧添加快捷动作
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={quickActions.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <SortableActionItem
                        key={action.id}
                        action={action}
                        onRemove={handleRemoveAction}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">可用快捷动作</h2>
              <p className="text-xs text-slate-500">点击添加到顶部快捷栏</p>
            </div>
          </div>

          <div className="flex-1">
            {availableToAdd.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                <Check className="w-10 h-10 mb-2 opacity-30" />
                已添加全部快捷动作
              </div>
            ) : (
              <div className="space-y-2">
                {availableToAdd.map((action) => {
                  const Icon = actionIconMap[action.icon] || Zap;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAddAction(action)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                        {action.label}
                      </div>
                      <Plus className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
