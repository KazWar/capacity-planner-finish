<script>
import Vue from 'vue'
import { mapState } from 'vuex'

Vue.mixin({
	computed:{
		...mapState('user',['current']),
		...mapState('guardian',['current'])
	}
})
</script>
