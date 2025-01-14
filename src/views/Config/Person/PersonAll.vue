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

const personConfig = useStore().personConfig
const { getAllPersonList: allPersonList, getAlreadyPersonList: alreadyPersonList } = storeToRefs(personConfig)
const limitType = '.xlsx,.xls'
// const personList = ref<any[]>([])

const resetDataDialog = ref()
const delAllDataDialog = ref()

const handleFileChange = async (e: Event) => {
    let dataBinary = await readFileBinary(((e.target as HTMLInputElement).files as FileList)[0]!)
    let workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true })
    let workSheet = workBook.Sheets[workBook.SheetNames[0]]
    const excelData = XLSX.utils.sheet_to_json(workSheet)
    const allData = addOtherInfo(excelData);
    personConfig.resetPerson()
    const listAllPerson = allData.map(item => ({
      uid: `${item.uid}`,
      name: `${item.name}`,
      identity: item.department.split(" -")[0],
      x: 0,
      y: 5,
      department: item.department.split(" -")[1],
      id: item.id,
      createTime: "2025-01-11 12:13:40",
      updateTime: "2025-01-11 12:13:40",
      prizeName: [],
      prizeTime: [],
      prizeId: [],
      isWin: false,
    }));
  console.log(listAllPerson, "============")
  personConfig.addNotPersonList(listAllPerson)
}
const exportData = () => {
    let data = JSON.parse(JSON.stringify(allPersonList.value))
    // 排除一些字段
    for (let i = 0; i < data.length; i++) {
        delete data[i].x
        delete data[i].y
        delete data[i].id
        delete data[i].createTime
        delete data[i].updateTime
        delete data[i].prizeId
        // 修改字段名称
        if (data[i].isWin) {
            data[i].isWin = 'YES'
        } else {
            data[i].isWin = 'No'
        }
        // 格式化数组为
        data[i].prizeTime = data[i].prizeTime.join(',')
        data[i].prizeName = data[i].prizeName.join(',')
    }
    let dataString = JSON.stringify(data)
    dataString = dataString
        .replaceAll(/uid/g, 'Mã NV')
        .replaceAll(/isWin/g, 'Chiến thắng')
        .replaceAll(/department/g, 'Phòng ban')
        .replaceAll(/name/g, 'Tên NV')
        .replaceAll(/identity/g, 'Chức danh')
        .replaceAll(/prizeName/g, 'Loại giải')
        .replaceAll(/prizeTime/g, 'Thời gian trúng giải')

    data = JSON.parse(dataString)

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
