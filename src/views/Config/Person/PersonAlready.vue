<!-- eslint-disable vue/no-parsing-error -->
<script setup lang='ts'>
import {ref} from 'vue';
import useStore from '@/store'
import {IPersonConfig} from '@/types/storeType';
import {storeToRefs} from 'pinia';
import DaiysuiTable from '@/components/DaiysuiTable/index.vue'

const personConfig = useStore().personConfig

const {getAlreadyPersonList: alreadyPersonList, getAlreadyPersonDetail: alreadyPersonDetail} = storeToRefs(personConfig)
// const personList = ref<any[]>(
//     alreadyPersonList
// )


// const deleteAll = () => {
//     personConfig.deleteAllPerson()
// }

const isDetail = ref(false)
const handleMoveNotPerson = (row: IPersonConfig) => {
  personConfig.moveAlreadyToNot(row)
}

const tableColumnsList = [
  {
    label: 'Mã NV',
    props: 'uid',
    sort: true
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
    label: 'Chức vụ',
    props: 'identity',
  },
  {
    label: 'Tên giải',
    props: 'prizeName',
    sort: true,
  },
  {
    label: 'Action',
    actions: [
      {
        label: 'Xóa',
        type: 'btn-info',
        onClick: (row: IPersonConfig) => {
          handleMoveNotPerson(row)
        }
      },
    ]
  },
]
const tableColumnsDetail = [
  {
    label: 'Mã NV',
    props: 'uid',
    sort: true
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
    label: 'Chức vụ',
    props: 'identity',
  },
  {
    label: 'prizeName',
    props: 'prizeName',
    sort: true,
  },
  {
    label: 'prizeTime',
    props: 'prizeTime',

  },
  {
    label: 'Action',
    actions: [
      {
        label: 'Xóa',
        type: 'btn-info',
        onClick: (row: IPersonConfig) => {
          handleMoveNotPerson(row)
        }
      },

    ]
  },
]
</script>

<template>
  <div class="overflow-y-auto">

    <h2>Quản lý người trúng thưởng</h2>
    <div class="flex items-center justify-start gap-10">
      <!-- <button class="btn btn-error btn-sm" @click="deleteAll">Xóa tất cả</button> -->
      <div>
        <span>Số lượng người trúng thưởng：</span>
        <span>{{ alreadyPersonList.length }}</span>
      </div>
      <div class="flex flex-col">
        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="label-text">Detail:</span>
            <input type="checkbox" class="border-solid toggle toggle-primary border-1" v-model="isDetail"/>
          </label>
        </div>
      </div>
    </div>
    <DaiysuiTable v-if="!isDetail" :tableColumns="tableColumnsList" :data="alreadyPersonList"></DaiysuiTable>

    <DaiysuiTable v-if="isDetail" :tableColumns="tableColumnsDetail" :data="alreadyPersonDetail"></DaiysuiTable>
  </div>
</template>

<style lang='scss' scoped></style>
