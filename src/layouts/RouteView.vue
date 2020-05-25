<template>
  <keep-alive :include="keepAlive">
    <router-view/>
  </keep-alive>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RouteView',
  data () {
    return {
      exclude: []
    }
  },
  computed: {
    ...mapGetters({
      keepAlive: 'getKeepAlive'
    })
  }
}
</script>
