Table 重封装组件说明
====


封装说明
----

>  基础的使用方式与 API 与 [官方版(Table)](https://vuecomponent.github.io/ant-design-vue/components/table-cn/) 本一致，在其基础上，封装了加载数据的方法。
>



内置方法
----

通过 `this.$refs.table` 调用

`this.$refs.table.onSearch()` 查询表格数据 在表格数据变化时需调用


内置属性
----
> 除去 `a-table` 自带属性外，还而外提供了一些额外属性属性  


| 属性           | 说明                                            | 类型              | 默认值 |
| -------------- | ----------------------------------------------- | ----------------- | ------ |
| search         | 查询参数 是否显示查询                             | [object] | null   |
| extraHeight    | 用于计算页面最佳高度                              | Number            |        |
| data           | 加载数据                                         | Array             | -      |
| pagination     | 自动加载分页数据                                  | Boolean           |        |
| scroll         | 表格scroll设置                                   | Object            |        |

