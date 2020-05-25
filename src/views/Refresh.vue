<template>
  <div></div>
</template>

<script>
export default {
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        vm.$router.replace(from.fullPath)
      })
    })
  }
}
</script>
