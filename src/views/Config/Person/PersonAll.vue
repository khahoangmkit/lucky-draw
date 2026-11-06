<!-- eslint-disable vue/no-parsing-error -->
<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import useStore from '@/store'
import { IPersonConfig } from '@/types/storeType';
import { storeToRefs } from 'pinia'
import * as XLSX from 'xlsx'
import { readFileBinary } from '@/utils/file'
import { addOtherInfo } from '@/utils'
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'
import dayjs from 'dayjs'

const personConfig = useStore().personConfig
const { getAllPersonList: allPersonList, getAlreadyPersonList: alreadyPersonList } = storeToRefs(personConfig)
const limitType = '.xlsx,.xls'
// const personList = ref<any[]>([])

const resetDataDialog = ref()
const delAllDataDialog = ref()

const DEPARTMENT_ALIASES = [
    'department',
    'phòng ban',
    'phong ban',
    'bộ phận',
    'bo phan',
    'đơn vị',
    'don vi',
    'phòng/ban',
    'phong/ban',
    'phòng',
    'phong',
    '部门',
]

const IDENTITY_ALIASES = [
    'identity',
    'chức danh',
    'chuc danh',
    'chức vụ',
    'chuc vu',
    'vị trí',
    'vi tri',
    'vai trò',
    'vai tro',
    'công việc',
    'cong viec',
    'nghề nghiệp',
    'nghe nghiep',
    '身份',
    '职位',
]

const UID_ALIASES = [
    'uid',
    'mã nv',
    'ma nv',
    'mã nhân viên',
    'ma nhan vien',
    'mã số',
    'ma so',
    'stt',
    'số thứ tự',
    'so thu tu',
    'số thẻ',
    'so the',
    'id',
    'msnv',
    'sbd',
    'số báo danh',
    'so bao danh',
    '编号',
    '工号',
]

const NAME_ALIASES = [
    'name',
    'tên nv',
    'ten nv',
    'họ và tên',
    'ho va ten',
    'họ tên',
    'ho ten',
    'tên',
    'ten',
    'họ & tên',
    'fullname',
    'full name',
    'tên nhân viên',
    'ten nhan vien',
    'họ tên nhân viên',
    'ho ten nhan vien',
    '姓名',
]

const getFieldValue = (item: Record<string, any>, aliases: string[]): string => {
    const keys = Object.keys(item)
    for (const key of keys) {
        const cleanKey = key.trim().toLowerCase()
        for (const alias of aliases) {
            if (cleanKey === alias.trim().toLowerCase()) {
                const val = item[key]
                if (val !== undefined && val !== null) {
                    return String(val).trim()
                }
            }
        }
    }
    return ''
}

const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
        let dataBinary = await readFileBinary(file)
        let workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true })
        let workSheet = workBook.Sheets[workBook.SheetNames[0]]
        const excelData = XLSX.utils.sheet_to_json(workSheet)
        if (!excelData || excelData.length === 0) {
            return
        }
        const allData = addOtherInfo(excelData)
        personConfig.resetPerson()
        const listAllPerson: IPersonConfig[] = allData.map((item: any, index: number) => {
            const uid = getFieldValue(item, UID_ALIASES) || `${index + 1}`
            const name = getFieldValue(item, NAME_ALIASES) || `Thành viên ${index + 1}`
            const department = getFieldValue(item, DEPARTMENT_ALIASES)
            const identity = getFieldValue(item, IDENTITY_ALIASES)

            return {
                id: item.id ?? index,
                uid,
                name,
                department,
                identity,
                x: item.x ?? 0,
                y: item.y ?? 5,
                createTime: item.createTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                updateTime: item.updateTime || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                prizeName: [],
                prizeTime: [],
                prizeId: [],
                isWin: false,
            }
        })
        console.log(listAllPerson, "============")
        personConfig.addNotPersonList(listAllPerson)
    } finally {
        target.value = ''
    }
}
const exportData = () => {
    const data = allPersonList.value.map((item: IPersonConfig) => ({
        'Mã NV': item.uid,
        'Tên NV': item.name,
        'Phòng ban': item.department,
        'Chức danh': item.identity,
        'Chiến thắng': item.isWin ? 'YES' : 'NO',
        'Loại giải': (item.prizeName || []).join(','),
        'Thời gian trúng giải': (item.prizeTime || []).join(','),
    }))

    if (data.length > 0) {
        const dataBinary = XLSX.utils.json_to_sheet(data)
        const dataBinaryBinary = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(dataBinaryBinary, dataBinary, 'Sheet1')
        XLSX.writeFile(dataBinaryBinary, 'data.xlsx')
    }
}

const resetData = () => {
    personConfig.resetAlreadyPerson()
}

const deleteAll = () => {
    personConfig.deleteAllPerson()
}

const delPersonItem = (row: IPersonConfig) => {
    personConfig.deletePerson(row)
}

const tableColumns = [
    {
        label: 'Mã NV',
        props: 'uid',
    },
    {
        label: 'Tên NV',
        props: 'name',
    },
    {
        label: 'Phòng ban',
        props: 'department',
    },
    {
        label: 'Chức danh',
        props: 'identity',
    },
    {
        label: 'Winner',
        props: 'isWin',
        formatValue(row: IPersonConfig) {
            return row.isWin ? 'Yes' : 'No'
        }
    },
    {
        label: 'Action',
        actions: [
            // {
            //     label: '编辑',
            //     type: 'btn-info',
            //     onClick: (row: any) => {
            //         delPersonItem(row)
            //     }
            // },
            {
                label: 'Xóa',
                type: 'btn-error',
                onClick: (row: IPersonConfig) => {
                    delPersonItem(row)
                }
            },

        ]
    },
]
onMounted(() => {
})
</script>

<template>
    <dialog id="my_modal_1" ref="resetDataDialog" class="border-none modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Cảnh báo!</h3>
            <p class="py-4">Thao tác này sẽ xóa thông tin trúng thưởng của nhân viên, bạn có muốn tiếp tục không?</p>
            <div class="modal-action">
                <form method="dialog" class="flex gap-3">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn" @click="resetDataDialog.close()">Hủy</button>
                    <button class="btn" @click="resetData">Xác nhận</button>
                </form>
            </div>
        </div>
    </dialog>
    <dialog id="my_modal_1" ref="delAllDataDialog" class="border-none modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">Cảnh báo!</h3>
            <p class="py-4">Thao tác này sẽ xóa tất cả dữ liệu nhân viên, bạn có muốn tiếp tục không?</p>
            <div class="modal-action">
                <form method="dialog" class="flex gap-3">
                    <!-- if there is a button in form, it will close the modal -->
                    <button class="btn" @click="delAllDataDialog.close()">Hủy</button>
                    <button class="btn" @click="deleteAll">Xác nhận</button>
                </form>
            </div>
        </div>
    </dialog>
    <div class="min-w-1000px">

        <h2>Quản lý nhân viên</h2>
        <div class="flex gap-3">
            <button class="btn btn-error btn-sm" @click="delAllDataDialog.showModal()">Xóa tất cả</button>
            <div class="tooltip tooltip-bottom" data-tip="Sau khi tải file về, bạn điền dữ liệu vào excel và lưu dưới dạng xlsx">
                <a class="no-underline btn btn-secondary btn-sm" download="template_data.xlsx" target="_blank"
                    href="/log-lottery/template_data.xlsx">Tải file mẫu</a>
            </div>
            <div class="">
                <label for="explore">

                    <div class="tooltip tooltip-bottom" data-tip="Tải lên tệp excel đã sửa đổi">
                        <input type="file" class="" id="explore" style="display: none" @change="handleFileChange"
                            :accept="limitType" />

                        <span class="btn btn-primary btn-sm">Import Data</span>
                    </div>
                </label>
                <!-- <button class="btn btn-primary btn-sm">上传excel</button> -->

            </div>
            <button class="btn btn-error btn-sm" @click="resetDataDialog.showModal()">Reset Data</button>
            <button class="btn btn-accent btn-sm" @click="exportData">Xuất kết quả</button>
            <div>
                <span>Số người trúng thưởng：</span>
                <span>{{ alreadyPersonList.length }}</span>
                <span>&nbsp;/&nbsp;</span>
                <span>{{ allPersonList.length }}</span>
            </div>
        </div>
        <DaiysuiTable :tableColumns="tableColumns" :data="allPersonList"></DaiysuiTable>
    </div>
</template>

<style lang='scss' scoped></style>
