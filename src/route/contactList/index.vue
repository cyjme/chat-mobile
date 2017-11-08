<template>
<div id="chatbox">
	<div id="friendslist">
    	<div id="topmenu">
        <div class="left"></div>
        <div class="right">
          <span>
          {{currentUser==null?"":currentUser.name}}
          </span>
        </div>
      </div>

      <div id="friends">
      	<div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.token)">
          	<img :src="contact.avatar" />
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
export default {
  name: "contactList",
  props: ["contacts", "newMsg"],
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
    }
  },
  computed: {
    currentUser: function currentUser() {
      let contact;
      this.contacts.map((item, index) => {
        if (item.token === this.$route.params.token) {
          contact = item;
        }
      });

      return contact;
    }
  }
};
</script>

<style>

</style>
