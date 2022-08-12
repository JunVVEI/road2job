<template>
  <div id="main">
    <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd">Add</a-button>
    <a-table :dataSource="dataSource" :columns="columns" bordered :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-button type="link" @click="seeDetail(record)">查看详情</a-button>
          <a-button type="link" @click="edit(record)">编辑</a-button>
          <a-popconfirm
              v-if="dataSource.length"
              title="确定删除？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onDelete(record.key)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>

    <a-modal v-model:visible="showDetail" title="详情" @ok="handleDetailOk" style="width: 50vw">
      <a-descriptions bordered :column="1">
        <a-descriptions-item v-for="(value, key) in detailInfo" :key="key" :label="key">
          {{ value }}
        </a-descriptions-item>

      </a-descriptions>
    </a-modal>
    <a-modal v-model:visible="showEdit" title="编辑" @ok="handleEditOk" style="width: 50vw">
      <a-form
          :model="editData"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
      >
        <a-form-item label="公司" name="公司">
          <a-input v-model:value="editData.company"/>
        </a-form-item>

        <a-form-item label="岗位" name="job">
          <a-input v-model:value="editData.job"/>
        </a-form-item>

        <a-form-item label="投递地址" name="link">
          <a-input v-model:value="editData.link"/>
        </a-form-item>

                <a-form-item label="投递时间" name="submitTime">
                  <a-date-picker
                      v-model:value="editData.submitTime"
                      format="YYYY-MM-DD HH:mm:ss"
                      valueFormat="YYYY-MM-DD HH:mm:ss"
                      :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
                  />
                </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="showAdd" title="新增数据" @ok="handleAddOk">
      <a-form
          :model="newRow"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
      >
        <a-form-item label="公司" name="公司">
          <a-input v-model:value="newRow.company"/>
        </a-form-item>

        <a-form-item label="岗位" name="job">
          <a-input v-model:value="newRow.job"/>
        </a-form-item>

        <a-form-item label="投递地址" name="link">
          <a-input v-model:value="newRow.link"/>
        </a-form-item>

        <a-form-item label="投递时间" name="submitTime">
          <a-date-picker
              v-model:value="newRow.submitTime"
              format="YYYY-MM-DD HH:mm:ss"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
          />
        </a-form-item>

      </a-form>
    </a-modal>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from "vue"
import dayjs from 'dayjs'

export default {
  setup() {
    const columns = [
      {
        title: '公司',
        dataIndex: 'company',
        key: 'company',
      },
      {
        title: '岗位',
        dataIndex: 'job',
        key: 'job',
      },
      {
        title: '投递连接',
        dataIndex: 'link',
        key: 'link',
      },
      {
        title: '投递时间',
        dataIndex: 'submitTime',
        key: 'submitTime',
      },
      {
        title: '操作',
        dataIndex: 'operation',
      }
    ]
    const dataSource = ref([])
    const count = computed(() => dataSource.value.length + 1)

    let showAdd = ref(false)
    let newRow = reactive({
      company: '',
      job: '',
      link: '',
      submitTime: '',
    })

    let showDetail = ref(false)
    let detailInfo = ref({})

    let showEdit = ref(false)
    let editData = ref({})

    onMounted(() => {
      window.ipcRenderer.on("dataSource", (e, arg) => {
        dataSource.value = JSON.parse(arg)
      });

      read()
    })

    const handleAdd = () => {
      showAdd.value = true
    };
    const handleAddOk = () => {
      const newData = JSON.parse(JSON.stringify(newRow))
      newData.key = `${count.value}`
      dataSource.value.push(newData)

      save()

      showAdd.value = false
      resetNewRow()
    }
    const resetNewRow = () => {
      for (let key in newRow) {
        newRow[key] = ''
      }
    }

    const seeDetail = (recorde) => {
      for (let key in recorde) {
        let title = key2title(key)
        if (title !== '') {
          detailInfo.value[title] = recorde[key]
        }
      }
      showDetail.value = true
    }
    const handleDetailOk = () => {
      showDetail.value = false
    };

    const edit = (recorde) => {
      editData.value = JSON.parse(JSON.stringify(recorde))
      showEdit.value = true
    }
    const handleEditOk = () => {
      dataSource.value[editData.value['key'] - 1] = editData.value
      save()
      showEdit.value = false
    }

    const onDelete = key => {
      dataSource.value = dataSource.value.filter(item => item.key !== key);
      save()
    }


    const key2title = (key) => {
      for (let item of columns) {
        if (item.key == key) {
          return item.title
        }
      }
      return ""
    }

    const read = () => {
      window.ipcRenderer.send("read")
    }
    const save = () => {
      window.ipcRenderer.send("write", JSON.stringify(dataSource.value))
    }

    return {
      dayjs,

      dataSource,
      columns,
      showAdd,
      newRow,
      showDetail,
      detailInfo,
      showEdit,
      editData,

      handleAddOk,
      handleAdd,

      seeDetail,
      handleDetailOk,

      edit,
      handleEditOk,

      onDelete
    }
  },

}
</script>

<style>
#main {
  padding: 30px;
}
</style>