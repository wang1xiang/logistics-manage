<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
    <Table
      ref="table"
      bordered
      :columns="columns"
      :data="loadData"
      :loading="tableLoading"
      :pagination="true"
      :scroll="{x: 'auto'}"
      :search="{
        showHeader: true,
        searchParam: ['name'],
        localName: '批次名称'
      }"
      :extraHeight="300"
    >
      <template v-slot:name>
        <a-button type="primary" style="margin-left: 2px" @click="addBatch">新增批次</a-button>
      </template>
      <span slot="status" slot-scope="text">
        <a-tag :color="!!text ? '#f50' : '#87d068'">{{ !!text ? '已停用' : '正在使用' }}</a-tag>
      </span>
      <span slot="createTime" slot-scope="text">
        {{ text | moment }}
      </span>
      <!-- eslint-disable-next-line -->
      <span slot="action" slot-scope="text, record">
        <template>
          <a @click="handleEdit(record)">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除吗?"
            @confirm="handleDel(record)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </span>
    </Table>
    <a-modal
      :title="type === 'add' ? '新增批次' : '修改批次'"
      :visible="showModal"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      :width="600"
      @ok="handlerConfig"
      @cancel="showModal = false">
      <a-form :form="form" @submit="handlerConfig">
        <a-form-item v-bind="formItemLayout" label="名称">
          <a-input
            placeholder="请输入批次名称"
            v-decorator="[
              'name',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入批次名称'
                  }
                ]
              }
            ]"
          ></a-input>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="状态">
          <a-switch checkedChildren="正在使用" unCheckedChildren="已停止" v-model="status"></a-switch>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import pick from 'lodash.pick'
import Table from '@/components/Table'
import { removeKeepAlive } from '@/utils/mixin'
import { fetch, urls } from '@/api'
export default {
  name: 'BatchManage',
  mixins: [removeKeepAlive],
  components: {
    Table
  },
  data () {
    return {
      type: 'add',
      showModal: false,
      record: {},
      form: this.$form.createForm(this),
      formItemLayout: {
        labelCol: {
          span: 7
        },
        wrapperCol: {
          span: 12
        }
      },
      status: true,
      confirmLoading: false,
      // 表头
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          width: '30%'
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '20%',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: '30%',
          sorter: (a, b) => a.createTime - b.createTime,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      tableLoading: false,
      loadData: []
    }
  },

  created () {
    this.getBatch()
  },
  methods: {
    getBatch () {
      this.tableLoading = true
      fetch(urls.batch.get).then(res => {
        if (res.data.errorCode === 0) {
          this.loadData = res.data.responseBody || []
          this.$nextTick(() => {
            this.$refs.table.onSearch()
          })
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    handleEdit (record) {
      this.showModal = true
      this.record = record
      this.status = !record.status
      this.type = 'update'
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue(pick(record, ['name']))
      })
    },
    handleDel (record) {
      this.tableLoading = true
      const ids = record.uuid.split(' ')
      fetch(urls.batch.delete, { ids }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('删除成功')
          this.loadData = this.loadData.filter(item => item.uuid !== record.uuid)
          this.$nextTick(() => {
            this.$refs.table.onSearch()
          })
        } else {
          this.$message.error(res.data.message)
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    addBatch () {
      this.status = true
      this.showModal = true
      this.type = 'add'
      const { form: { resetFields } } = this
      resetFields()
    },
    handlerConfig () {
      this.form.validateFields((err, values) => {
        if (!err) {
          const { type, record } = this
          const param = {
            name: values.name,
            status: !this.status
          }
          let url = ''
          if (type === 'add') {
            url = urls.batch.add
          } else {
            url = urls.batch.update
            param.uuid = record.uuid
          }

          fetch(url, param).then(res => {
            if (res.data.errorCode === 0) {
              this.$message.success(type === 'add' ? '新增批次成功' : '修改批次成功')
              this.showModal = false
              this.getBatch()
            } else {
              this.$message.error(res.data.message)
            }
          })
        }
      })
    }
  }
}
</script>
