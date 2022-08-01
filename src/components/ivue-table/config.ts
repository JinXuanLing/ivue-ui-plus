import { h } from 'vue';
import { hasOwn } from '@vue/shared';
import { get, set } from 'lodash-unified';
import IvueCheckbox from '../ivue-checkbox/index.vue';

// ts
import type { VNode } from 'vue';
import type { TableColumnCtx } from './table-column/defaults';
import type { TreeNode } from './table/defaults';
import type { Store } from './store';

const defaultClassNames = {
  selection: 'ivue-table-column--selection',
  expand: 'ivue-table--expand-column',
};


export type Arrayable<T> = T | T[]

// 行样式
export const cellStyles = {
  default: {
    order: '',
  },
  selection: {
    width: 48,
    minWidth: 48,
    columnWidth: 48,
    order: '',
  },
  expand: {
    width: 48,
    minWidth: 48,
    columnWidth: 48,
    order: '',
  },
  index: {
    width: 48,
    minWidth: 48,
    columnWidth: 48,
    order: '',
  },
};


// 合并选项
export function mergeOptions<T, K>(defaults: T, config: K): T & K {
  const options = {} as T & K;

  let key;

  // 复制对象
  for (key in defaults) {
    options[key] = defaults[key];
  }

  // config
  for (key in config) {
    if (hasOwn(config as unknown as Record<string, any>, key)) {
      const value = config[key];
      if (typeof value !== 'undefined') {
        options[key] = value;
      }
    }
  }

  return options;
}

// https://github.com/reduxjs/redux/blob/master/src/compose.js
// 函数执行的顺序是从右到左
export function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}

// 渲染行
export function defaultRenderCell<T>({
  row,
  column,
  $index,
}: {
  row: T
  column: TableColumnCtx<T>
  $index: number
}) {
  // 字段名称 对应列内容的字段名
  const property = column.property;
  const value = property && getProp(row, property).value;

  // 是否有格式化内容
  if (column && column.formatter) {
    return column.formatter(row, column, value, $index);
  }

  // 普通渲染
  return value?.toString?.() || '';
}

// 获取props
export const getProp = <T = any>(
  obj: Record<string, any>,
  path: Arrayable<string>,
  defaultValue?: any
): { value: T } => {
  return {
    get value() {
      return get(obj, path, defaultValue);
    },
    set value(val: any) {
      set(obj, path, val);
    },
  };
};


// 列
export function treeCellPrefix<T>(
  {
    row,
    treeNode,
    store,
  }: {
    row: T
    treeNode: TreeNode
    store: Store<T>
  },
  createPlacehoder = false
) {

  // 不是树节点
  if (!treeNode) {
    // 创建占位符
    if (createPlacehoder) {
      return [
        h('span', {
          class: 'ivue-table-placeholder'
        }),
      ];
    }

    return null;
  }

  // ele
  const ele: VNode[] = [];

  const callback = (e) => {
    e.stopPropagation();
    store.loadOrToggle(row);
  };


  if (treeNode.indent) {
  }

  if (typeof treeNode.expanded === 'boolean' && !treeNode.noLazyChildren) {
  }
  // 其他
  else {
    // ele.push(
    //   h('span', {
    //     class: ns.e('placeholder'),
    //   })
    // );
  }

  return ele;

}


// 需要替换的渲染函数
export const cellForced = {
  // 多选
  selection: {
    // 渲染头部
    renderHeader<T>({ store }: { store: Store<T> }) {
      return h(IvueCheckbox, {
        // 没有数据禁用
        disabled: store.states.data.value && store.states.data.value.length === 0,
        // 是否选择了全部
        modelValue: store.states.isAllSelected.value,
        // 更新modelValue
        'onUpdate:modelValue': store.toggleAllSelection,
        // 中间状态
        indeterminate: store.states.selection.value.length > 0 && !store.states.isAllSelected.value,
      });
    },
    // 渲染单元格
    renderCell<T>({
      row,
      column,
      store,
      $index
    }: {
      row: T
      column: TableColumnCtx<T>
      store: Store<T>
      $index: string
    }) {
      return h(IvueCheckbox, {
        disabled: column.selectable
          ? !column.selectable.call(null, row, $index)
          : false,
        modelValue: store.isSelected(row),
        onChange: () => {
          store.commit('rowSelectedChanged', row);
        },
        // 阻止捕获和冒泡阶段中当前事件
        onClick: (event: Event) => event.stopPropagation(),
      });
    },
    // 对应列是否可以排序
    sortable: false,
    // 对应列是否可以通过拖动改变宽度
    resizable: false,
  },
  // 索引
  index: {
    // 渲染头部
    renderHeader<T>({ column }: { column: TableColumnCtx<T> }) {
      return column.label || '#';
    },
    // 渲染单元格
    renderCell<T>({ column, $index, }: {
      column: TableColumnCtx<T>
      $index: number
    }) {
      let i = $index + 1;

      const index = column.index;

      // number
      if (typeof index === 'number') {
        i = $index + index;
      }
      // function
      else if (typeof index === 'function') {
        i = index($index);
      }

      return h('div', {}, [i]);
    },
  },
  expand: {}
};

// 获取默认的class
export const getDefaultClassName = (type) => {
  return defaultClassNames[type] || '';
};
