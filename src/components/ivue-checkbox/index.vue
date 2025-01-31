<template>
    <label :class="wrapperClasses">
        <!-- 方框外层 -->
        <span :class="contentClasses">
            <!-- 方框 -->
            <span :class="innerClasses" :style="innerStyles"></span>
            <!-- input 有组合 -->
            <input
                v-if="isGroup"
                type="checkbox"
                :class="inputClasses"
                :disabled="disabled"
                :value="label"
                v-model="data.groupModel"
                :name="name"
                @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
            />
            <!-- input 没有组合 -->
            <input
                v-else
                type="checkbox"
                :class="inputClasses"
                :disabled="disabled"
                :name="name"
                :checked="currentValue"
                @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
            />
        </span>
        <!-- 内容 -->
        <span :class="textClasses">
            <slot>{{ label }}</slot>
        </span>
    </label>
</template>

<script lang='ts'>
import { computed, defineComponent, reactive, watch, inject } from 'vue';
import { isCssColor, setTextColor } from '../../utils/helpers';
import { CheckboxContextKey } from '../ivue-checkbox-group/types/checkbox-group';

// type
import type { Props, Data } from './types/checkbox';

const prefixCls = 'ivue-checkbox';

export default defineComponent({
    name: prefixCls,
    emits: ['update:modelValue', 'on-change'],
    props: {
        /**
         * 只在单独使用时有效。可以使用 v-model 双向绑定数据
         *
         * @type {String | Number | Boolean}
         */
        modelValue: {
            type: [String, Number, Boolean],
            default: false,
        },
        /**
         * 是否禁用当前项
         *
         * @type {Boolean}
         */
        disabled: {
            type: Boolean,
        },
        /**
         * name 属性
         *
         * @type {String}
         */
        name: {
            type: String,
        },
        /**
         * 选中时的值，当使用类似 1 和 0 来判断是否选中时会很有用
         *
         * @type {String | Number | Boolean}
         */
        trueValue: {
            type: [String, Number, Boolean],
            default: true,
        },
        /**
         * 没有选中时的值，当使用类似 1 和 0 来判断是否选中时会很有用
         *
         * @type {String | Number | Boolean}
         */
        falseValue: {
            type: [String, Number, Boolean],
            default: false,
        },
        /**
         * 颜色
         *
         * @type {String}
         */
        color: {
            type: String,
            default: 'primary',
        },
        /**
         * 指定当前选项的 value 值，组合会自动判断当前选择的项目
         *
         * @type {String, Number, Boolean}
         */
        label: {
            type: [String, Number, Boolean],
            default: '',
        },
        /**
         * 是否显示边框
         *
         * @type {Boolean}
         */
        border: {
            type: Boolean,
            default: false,
        },
        /**
         * 设置 indeterminate 状态，只负责样式控制
         *
         * @type {Boolean}
         */
        indeterminate: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        // 组合
        const IvueCheckboxGroup = inject(CheckboxContextKey, {
            default: null,
        });

        // data
        const data = reactive<Data>({
            /**
             * input 焦点
             *
             * @type {Boolean}
             */
            focusInner: false,
            /**
             * 组合名称
             *
             * @type {String}
             */
            groupName: props.name,
            /**
             * 组合的 v-model
             *
             * @type {Array}
             */
            groupModel: [],
        });

        // computed

        // 外层样式
        const wrapperClasses = computed(() => {
            return [
                `${prefixCls}-wrapper`,
                {
                    [`${prefixCls}-wrapper--checked`]: currentValue.value,
                    [`${prefixCls}-wrapper--disabled`]: props.disabled,
                    [`${prefixCls}-group--item`]: isGroup.value,
                    [`${prefixCls}-border`]: props.border,
                },
            ];
        });

        // 内容外层
        const contentClasses = computed(() => {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-checked`]: currentValue.value,
                    [`${prefixCls}-disabled`]: props.disabled,
                    [`${prefixCls}-indeterminate`]: props.indeterminate,
                },
            ];
        });

        // 方框 class
        const innerClasses = computed(() => {
            const obj = {
                [`${prefixCls}-focus`]: data.focusInner,
            };

            // 文字样式
            const isTextColor: any = setTextColor(props.color);

            if (isTextColor.color && !isCssColor(isTextColor.color)) {
                obj[isTextColor.color] = true;
            }

            return [`${prefixCls}-inner`, obj];
        });

        // 方框 style
        const innerStyles = computed(() => {
            const obj: {
                color?: string;
            } = {};

            // 文字样式
            const isTextColor = setTextColor(props.color);
            if (isTextColor.color && isCssColor(isTextColor.color)) {
                obj.color = isTextColor.color;
            }

            return obj;
        });

        // 输入框
        const inputClasses = computed(() => {
            return `${prefixCls}-input`;
        });

        // 文字 class
        const textClasses = computed(() => {
            return [
                `${prefixCls}-label-text`,
                {
                    [`${prefixCls}-label-text--disabled`]: props.disabled,
                },
            ];
        });

        // 当前值
        const currentValue = computed(() => {
            // 有组合
            if (isGroup.value) {
                return (
                    IvueCheckboxGroup.props.modelValue.indexOf(props.label) >= 0
                );
            }
            // 没有组合
            else {
                return props.modelValue === props.trueValue;
            }
        });

        // 是否有组合
        const isGroup = computed(() => {
            if (IvueCheckboxGroup.name) {
                return true;
            }

            return false;
        });

        // method

        // 改变
        const handleChange = (event: Event) => {
            // 禁用
            if (props.disabled) {
                return false;
            }

            // 是否选中
            const checked = (event.target as HTMLInputElement).checked;

            // 设置 v-model
            const value = checked ? props.trueValue : props.falseValue;
            emit('update:modelValue', value);

            // 有组合
            if (isGroup.value) {
                IvueCheckboxGroup.handleChange(data.groupModel);
            } else {
                // 发送事件
                emit('on-change', value);
            }
        };

        // 获取焦点
        const handleFocus = () => {
            // input 焦点
            data.focusInner = true;
        };

        // 失去焦点
        const handleBlur = () => {
            // input 焦点
            data.focusInner = false;
        };

        // watch

        // 监听 v-model
        watch(
            () => props.modelValue,
            (value) => {
                // 当前值不符合
                if (
                    !(value === props.trueValue || value === props.falseValue)
                ) {
                    throw 'Value should be trueValue or falseValue.';
                }
            }
        );

        // 监听组合 v-model
        if (IvueCheckboxGroup.props) {
            watch(
                () => IvueCheckboxGroup.props.modelValue,
                (value: string[]) => {
                    data.groupModel = value || [];
                },
                {
                    // 同步监听
                    immediate: true,
                }
            );
        }

        return {
            prefixCls,
            // data
            data,

            // computed
            wrapperClasses,
            contentClasses,
            innerClasses,
            innerStyles,
            inputClasses,
            textClasses,
            currentValue,
            isGroup,

            // methods
            handleChange,
            handleFocus,
            handleBlur,
            IvueCheckboxGroup,
        };
    },
});
</script>
