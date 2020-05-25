<template>
  <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
    <Table
      bordered
      ref="table"
      :columns="columns"
      :rowKey="'uuid'"
      :data="loadData"
      :loading="tableLoading"
      :pagination="true"
      :scroll="{x: 'auto'}"
      :search="{
        showHeader: true,
        searchParam: ['username', 'name', 'password'],
        localName: '用户'
      }"
      :extraHeight="300"
    >
      <template v-slot:name>
        <a-button type="primary" @click="addBatch">新增用户</a-button>
      </template>
      <span slot="admin" slot-scope="text">
        <a-tag :color="!!text ? '#87d068' : '#f50'">{{ !!text ? '管理员' : '普通用户' }}</a-tag>
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
      :title="type === 'add' ? '新增用户' : '修改用户'"
      :visible="showModal"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      :width="600"
      @ok="handlerConfig"
      @cancel="showModal = false">
      <a-form :form="form" @submit="handlerConfig">
        <a-form-item v-bind="formItemLayout" label="名称">
          <a-input
            placeholder="请输入名称"
            v-decorator="[
              'name',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入名称'
                  }
                ]
              }
            ]"
          ></a-input>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="登陆名">
          <a-input
            placeholder="请输入登陆名"
            v-decorator="[
              'username',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入登陆名'
                  }
                ]
              }
            ]"
          ></a-input>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="密码">
          <a-input
            placeholder="请输入密码"
            v-decorator="[
              'password',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入密码'
                  }
                ]
              }
            ]"
          ></a-input>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="是否管理员">
          <a-switch
            v-model="admin"
          ></a-switch>
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
      confirmLoading: false,
      // 表头
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          width: '30%'
        },
        {
          title: '登录名',
          dataIndex: 'username',
          width: '20%'
        },
        {
          title: '密码',
          dataIndex: 'password',
          width: '20%'
        },
        {
          title: '是否管理员',
          dataIndex: 'admin',
          width: '10%',
          scopedSlots: { customRender: 'admin' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      tableLoading: false,
      loadData: [],
      admin: false
    }
  },

  created () {
    this.getBatch()
  },
  methods: {
    getBatch () {
      this.tableLoading = true
      fetch(urls.user.get).then(res => {
        if (res.data.errorCode === 0) {
          this.loadData = res.data.responseBody || []
          this.$nextTick(() => {
            // 调一下查询
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
      this.type = 'update'
      this.admin = !!record.admin
      const { form: { setFieldsValue } } = this
      this.$nextTick(() => {
        setFieldsValue(pick(record, ['name', 'username', 'password']))
      })
    },
    handleDel (record) {
      this.tableLoading = true
      const ids = record.uuid.split(' ')
      fetch(urls.user.delete, { ids }).then(res => {
        if (res.data.errorCode === 0) {
          this.$message.success('删除成功')
          this.loadData = this.loadData.filter(item => item.uuid !== record.uuid)
          // 删除之后 调一下查询
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
      this.admin = false
      this.showModal = true
      this.type = 'add'
      const { form: { resetFields } } = this
      resetFields()
    },
    handlerConfig () {
      this.form.validateFields((err, values) => {
        if (!err) {
          values.admin = Number(this.admin)
          const { type, record } = this
          let url = ''
          if (type === 'add') {
            url = urls.user.add
          } else {
            values.uuid = record.uuid
            url = urls.user.update
          }

          fetch(url, values).then(res => {
            if (res.data.errorCode === 0) {
              this.$message.success(type === 'add' ? '新增用户成功' : '修改用户成功')
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
