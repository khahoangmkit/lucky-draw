<script setup lang='ts'>
import { ref, watch, onMounted } from 'vue'
import useStore from '@/store'
import { storeToRefs } from 'pinia'
import { themeChange } from 'theme-change';
import zod from 'zod';
import daisyuiThemes from 'daisyui/src/theming/themes'
import { ColorPicker } from 'vue3-colorpicker';
import 'vue3-colorpicker/style.css';
import { isRgbOrRgba, isHex } from '@/utils/color'
import PatternSetting from './components/PatternSetting.vue'

const globalConfig = useStore().globalConfig
const personConfig = useStore().personConfig
const prizeConfig = useStore().prizeConfig
const { getTopTitle: topTitle,
    getTheme: localTheme,
    getPatterColor: patternColor,
    getPatternList: patternList,
    getCardColor: cardColor,
    getLuckyColor: luckyCardColor,
    getTextColor: textColor,
    getCardSize: cardSize,
    getTextSize: textSize,
    getRowCount: rowCount,
    getIsShowPrizeList: isShowPrizeList,
    getBackground: backgroundImage,
    getImageList: imageList
} = storeToRefs(globalConfig)
const { getAlreadyPersonList: alreadyPersonList, getNotPersonList: notPersonList } = storeToRefs(personConfig)
const colorPickerRef = ref()
const resetDataDialogRef = ref()
interface ThemeDaType {
    [key: string]: any
}
const isRowCountChange = ref(0) //0未改变，1改变,2加载中
const themeValue = ref(localTheme.value.name)
const topTitleValue = ref(structuredClone(topTitle.value))
const cardColorValue = ref(structuredClone(cardColor.value))
const luckyCardColorValue = ref(structuredClone(luckyCardColor.value))
const textColorValue = ref(structuredClone(textColor.value))
const cardSizeValue = ref(structuredClone(cardSize.value))
const textSizeValue = ref(structuredClone(textSize.value))
const rowCountValue = ref(structuredClone(rowCount.value))
const isShowPrizeListValue = ref(structuredClone(isShowPrizeList.value))
const patternColorValue = ref(structuredClone(patternColor.value))
const themeList = ref(Object.keys(daisyuiThemes))
const daisyuiThemeList = ref<ThemeDaType>(daisyuiThemes)
const backgroundImageValue = ref(backgroundImage.value)
const formData = ref({
    rowCount: rowCountValue,
})
const formErr = ref({
    rowCount: '',
})
const schema = zod.object({
    rowCount: zod.number({
        required_error: '必填项',
        invalid_type_error: '必须填入数字',
    })
        .min(1, '最小为1')
        .max(100, '最大为100')
    // 格式化


})
type ValidatePayload = zod.infer<typeof schema>
const payload: ValidatePayload = {
    rowCount: formData.value.rowCount,
}
const parseSchema = (props: ValidatePayload) => {
    return schema.parseAsync(props)
}

const resetPersonLayout = () => {
    isRowCountChange.value = 2
    setTimeout(() => {
        const alreadyLen = alreadyPersonList.value.length
        const notLen = notPersonList.value.length
        if (alreadyLen <= 0 && notLen <= 0) {
            return
        }
        const allPersonList = alreadyPersonList.value.concat(notPersonList.value)
        const newAlreadyPersonList = allPersonList.slice(0, alreadyLen)
        const newNotPersonList = allPersonList.slice(alreadyLen, notLen + alreadyLen)
        personConfig.deleteAllPerson()
        personConfig.addNotPersonList(newNotPersonList)
        personConfig.addAlreadyPersonList(newAlreadyPersonList, null)

        isRowCountChange.value = 0
    }, 1000)
}

const clearPattern = () => {
    globalConfig.setPatternList([] as number[])
}
const resetPattern = () => {
    globalConfig.resetPatternList()
}

const resetData = () => {
    globalConfig.reset();
    personConfig.reset();
    prizeConfig.resetDefault();
    // 刷新页面
    window.location.reload()
}

// const handleChangeShowFields = (fieldItem: any) => {
//     formData.value.showField.map((item) => {
//         if (item.label === fieldItem.label) {
//             item.value = !item.value
//         }
//     })
// }

watch(() => formData.value.rowCount, () => {
    payload.rowCount = formData.value.rowCount
    parseSchema(payload).then(res => {
        if (res.rowCount) {
            isRowCountChange.value = 1
            globalConfig.setRowCount(res.rowCount)
        }
    })
        .catch(err => {
            formErr.value.rowCount = err.issues[0].message
        })
})
watch(topTitleValue, (val) => {
    globalConfig.setTopTitle(val)
}),

    watch(themeValue, (val: any) => {
        const selectedThemeDetail = daisyuiThemeList.value[val]
        globalConfig.setTheme({ name: val, detail: selectedThemeDetail })
        themeChange(val)
        if (selectedThemeDetail.primary && (isHex(selectedThemeDetail.primary) || isRgbOrRgba(selectedThemeDetail.primary))) {
            globalConfig.setCardColor(selectedThemeDetail.primary)
        }
    }, { deep: true })

watch(cardColorValue, (val: string) => {
    globalConfig.setCardColor(val)
}, { deep: true })
watch(luckyCardColorValue, (val: string) => {
    globalConfig.setLuckyCardColor(val)
}, { deep: true })
watch(patternColorValue, (val: string) => {
    globalConfig.setPatterColor(val)
})
watch(textColorValue, (val: string) => {
    globalConfig.setTextColor(val)
}, { deep: true })
watch(cardSizeValue, (val: { width: number; height: number; }) => {
    globalConfig.setCardSize(val)
}, { deep: true }),
    watch(isShowPrizeListValue, () => {
        globalConfig.setIsShowPrizeList(isShowPrizeListValue.value)
    })
watch(backgroundImageValue, (val: {}) => {
    globalConfig.setBackground(val)
})
onMounted(() => {
})
</script>

<template>
    <dialog id="my_modal_1" ref="resetDataDialogRef" class="border-none modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Gợi ý!</h3>
            <p class="py-4">Thao tác này sẽ mất hết dữ liệu，tiếp tục？</p>
            <div class="modal-action">
                <form method="dialog" class="flex gap-3">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn" @click="resetDataDialogRef.close()">Hủy</button>
                    <button class="btn" @click="resetData">Xác nhận</button>
                </form>
            </div>
        </div>
    </dialog>
    <div>
        <h2>Config</h2>
        <div class="mb-8">
            <button class="btn btn-sm btn-primary" @click="resetDataDialogRef.showModal()">Đặt lại Config</button>
        </div>
        <label class="flex flex-row items-center w-full gap-24 mb-10 form-control">
            <div class="">
                <div class="label">
                    <span class="label-text">Title</span>
                </div>
                <input type="text" v-model="topTitleValue" placeholder="Nhập tiêu đề"
                    class="w-full max-w-xs input input-bordered" />
            </div>
        </label>
        <label class="flex flex-row items-center w-full gap-24 mb-10 form-control">
            <div class="">
                <div class="label">
                    <span class="label-text">Số lượng cột</span>
                </div>
                <input type="number" v-model="formData.rowCount" placeholder="Type here"
                    class="w-full max-w-xs input input-bordered" />
                <div class="help">
                    <span class="text-sm text-red-400 help-text" v-if="formErr.rowCount">
                        {{ formErr.rowCount }}
                    </span>
                </div>
            </div>
            <div>
                <div class="tooltip" data-tip="Mục này tốn thời gian và hiệu suất cao">
                    <button class="mt-5 btn btn-info btn-sm" :disabled="isRowCountChange != 1"
                        @click="resetPersonLayout">
                        <span>Đặt lại bố cục</span>
                        <span class="loading loading-ring loading-md" v-show="isRowCountChange == 2"></span>
                    </button>
                </div>
            </div>
        </label>
        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">Chọn chủ đề</span>
            </div>
            <select data-choose-theme class="w-full max-w-xs border-solid select border-1" v-model="themeValue">
                <option disabled selected>Chọn chủ đề</option>
                <option v-for="(item, index) in themeList" :key="index" :value="item">{{ item }}</option>
            </select>
        </label>
        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">Chọn nền</span>
            </div>
            <select data-choose-theme class="w-full max-w-xs border-solid select border-1"
                v-model="backgroundImageValue">
                <option disabled selected>Chọn nền</option>
                <option v-for="(item, index) in [{ name: '无', url: '', id: '' }, ...imageList]" :key="index"
                    :value="item">{{ item.name }}</option>
            </select>
        </label>
        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">Màu thẻ</span>
            </div>
            <ColorPicker ref="colorPickerRef" v-model="cardColorValue" v-model:pure-color="cardColorValue">
            </ColorPicker>
        </label>
        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">Màu thẻ chiến thắng</span>
            </div>
            <ColorPicker ref="colorPickerRef" v-model="luckyCardColorValue" v-model:pure-color="luckyCardColorValue">
            </ColorPicker>
        </label>

        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">màu văn bản</span>
            </div>
            <ColorPicker ref="colorPickerRef" v-model="textColorValue" v-model:pure-color="textColorValue">
            </ColorPicker>
        </label>
        <label class="flex flex-row w-full max-w-xs gap-10 mb-10 form-control">
            <div>
                <div class="label">
                    <span class="label-text">Chiều rộng thẻ</span>
                </div>
                <input type="number" v-model="cardSizeValue.width" placeholder="Type here"
                    class="w-full max-w-xs input input-bordered" />
            </div>
            <div>
                <div class="label">
                    <span class="label-text">Chiều cao thẻ</span>
                </div>
                <input type="number" v-model="cardSizeValue.height" placeholder="Type here"
                    class="w-full max-w-xs input input-bordered" />
            </div>
        </label>
        <label class="w-full max-w-xs mb-10 form-control">
            <div class="label">
                <span class="label-text">Font Size</span>
            </div>
            <input type="number" v-model="textSizeValue" placeholder="Type here"
                class="w-full max-w-xs input input-bordered" />
        </label>
        <label class="w-full max-w-xs form-control">
            <div class="label">
                <span class="label-text">Màu nổi bật mẫu</span>
            </div>
            <ColorPicker ref="colorPickerRef" v-model="patternColorValue" v-model:pure-color="patternColorValue">
            </ColorPicker>
        </label>
        <label class="flex flex-row items-center w-full gap-24 mb-0 form-control">
            <div>
                <div class="label">
                    <span class="label-text">Cài đặt mẫu</span>
                </div>
                <div class="h-auto">
                    <PatternSetting :rowCount="rowCount" :cardColor="cardColor" :patternColor="patternColor"
                        :patternList="patternList"></PatternSetting>
                </div>
            </div>
        </label>
        <div class="flex w-full h-24 gap-3 m-0">
            <button class="mt-5 btn btn-info btn-sm" @click.stop="clearPattern">
                <span>Xóa cài đặt mẫu</span>
            </button>
            <div class="tooltip" data-tip="Cài đặt mẫu mặc định có hiệu lực cho 17 cột. Vui lòng tự đặt số cột khác.">
                <button class="mt-5 btn btn-info btn-sm" @click="resetPattern">
                    <span>Cài đặt mẫu mặc định</span>
                </button>
            </div>
        </div>

        <label class="w-full max-w-xs mb-10 form-control">
            <div class="label">
                <span class="label-text">Luôn hiển thị danh sách giải thưởng</span>
            </div>
            <input type="checkbox" :checked="isShowPrizeListValue"
                @change="isShowPrizeListValue = !isShowPrizeListValue"
                class="mt-2 border-solid checkbox checkbox-secondary border-1" />
        </label>

    </div>
</template>

<style lang='scss' scoped></style>
