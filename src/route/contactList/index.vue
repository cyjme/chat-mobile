<template>
  <div id="chatbox">
    <div id="friendslist">
      <div id="topmenu">
        <a href="https://www.ideapar.com">
          <div class="left"></div>
        </a>
        <div class="right">
          <span>
          {{currentUser.nick}}
          </span>
        </div>
      </div>

      <div id="friends">
        <div class="friend" v-for="contact in contacts" :key="contact.token" @click="handleClick(contact.userId)">
          <div v-if="contact.avt==''?true:false" class="text-avatar">{{contact.nick.substring(0,1)}}</div>
          <img v-if="contact.avt==''?false:true"
               :src="'https://qiniu.ideapar.com/'+JSON.parse(contact.avt)[0]+'?imageMogr2/thumbnail/80x/strip/quality/50/format/jpg'"/>
          <p>
            <strong>{{contact.nick}}</strong>
            <br/>
            <span>{{contact.phone}}</span>
          </p>
          <div class="status available" v-if="contact.hasOwnProperty('unreadCount')==true">
            {{contact.hasOwnProperty('unreadCount')==true? contact.unreadCount:''}}
          </div>
          <div v-if="contact.msgs.length>0" style="position: absolute;top: 50px;right: 40px">
            {{(new Date() - new Date(contact.msgs[contact.msgs.length-1].created_at))/(24*60*60*1000) > 1? new
            Date(contact.msgs[contact.msgs.length-1].created_at).getMonth()+1 +'月'+new
            Date(contact.msgs[contact.msgs.length-1].created_at).getDate() +"日":''}}
            {{new Date(contact.msgs[contact.msgs.length-1].created_at).getHours()+":"+(new
            Date(contact.msgs[contact.msgs.length-1].created_at).getMinutes()<10 ? "0"+new
            Date(contact.msgs[contact.msgs.length-1].created_at).getMinutes(): new
            Date(contact.msgs[contact.msgs.length-1].created_at).getMinutes())}}
          </div>
        </div>

        <!--<div id="search">-->
        <!--<input type="text" id="searchfield" placeholder="Search contacts..."/>-->
        <!--</div>-->
      </div>
    </div>
  </div>

</template>

<script>
  import {scrollBottom} from "../../help";

  export default {
    name: "contactList",
    props: ["contacts", "newMsg", "currentUser"],
    created: function () {
    },
    methods: {
      updateLastReadAt(toUserId) {
        this.axios.get(`/update-last-read-at/${toUserId}`).then(() => {
        });
      },
      handleClick(toUserId) {
        this.updateLastReadAt(toUserId);
        this.clearUnreadCount(toUserId);
        this.$router.push({
          name: "Chat",
          params: {
            toUser: toUserId
          }
        });
        scrollBottom();
      },
      clearUnreadCount(userId) {
        this.contacts.map((contact, index) => {
          if (contact.userId == userId) {
            delete contact.unreadCount
            // console.warn("contact",contact)
            // this.contacts.splice(index, 1, contact)
          }
        })
      }
    }
  };
</script>

<style>

</style>
