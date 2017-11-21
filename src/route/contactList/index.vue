<template>
<div id="chatbox">
	<div id="friendslist">
    	<div id="topmenu">
        <div class="left"></div>
        <div class="right">
          <span>
          {{currentUser.name}}
          </span>
        </div>
      </div>

      <div id="friends">
      	<div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.token)">
            <div v-if="contact.avatar==''?true:false" class="text-avatar">{{contact.name.substring(0,1)}}</div>
          	<img v-if="contact.avatar==''?false:true" :src="contact.avatar" />
              <p>
              	<strong>{{contact.name}}</strong>
                  <br />
	              <span>{{contact.info}}</span>
              </p>
              <div class="status available"></div>
          </div>

          <div id="search">
	          <input type="text" id="searchfield" placeholder="Search contacts..." />
          </div>
      </div>                
    </div>	
</div>	

</template>

<script>
import { scrollBottom } from "../../help";
export default {
  name: "contactList",
  props: ["contacts", "newMsg", "currentUser"],
  created: function() {},
  methods: {
    handleClick(token) {
      let userToken = this.$route.params.token;
      this.$router.push({
        name: "Chat",
        params: {
          token: userToken,
          toToken: token
        }
      });
      scrollBottom();
    }
  }
};
</script>

<style>

</style>
