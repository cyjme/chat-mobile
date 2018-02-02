<template>
<div>
    <div id="chatview" class="p1">
        <div id="profile">
            <div class="backBtn" @click="goToContacts">
                <img src="../../assets/left.png">
            </div>
            <div id="close" @click="goToContacts" style="display: none">
                <div class="cy s1 s2 s3"></div>
                <div class="cx s1 s2 s3"></div>
            </div>
            <p>{{profile==null?"":profile.nick}}</p>
            <span>{{profile==null?"":profile.phone}}</span>
        </div>
        <div id="chat-messages" v-on:scroll="handleScroll">
        	<label>已经到顶端了</label>
            <div  v-for="msg in msgList" :class="msg.to==to?'message right':'message'" :key="msg.msgId">
                <template v-if="msg.to == to">
                  <div v-if="currentUser.avt==''?true:false" class="text-avatar">{{currentUser.nick.substring(0,1)}}</div>
                  <img v-if="currentUser.avt==''?false:true" :src="currentUser.avt" />
                </template>
                <template v-if="msg.to != to">
                  <div v-if="profile.avt==''?true:false" class="text-avatar">{{profile.nick.substring(0,1)}}</div>
                  <img v-if="profile.avt==''?false:true" :src="profile.avt" />
                </template>
            	<!-- <img :src="msg.to == to?currentUser.avt:profile.avt" /> -->
                <div class="bubble">
                  <template v-if="msg.contentType==='img'">
                    <img v-preview="msg.content" :src="msg.content" class="img-msg">
                  </template>
                  <template v-if="msg.contentType==='file'">
                    <!--<img v-preview="msg.content" :src="msg.content" class="img-msg">-->
                    <a :href="msg.content">
                    <div class="file">
                    </div>
                    </a>
                  </template>
                  <template v-if="msg.contentType==='text'">
                    {{msg.content}}
                  </template>
                    <div class="corner"></div>
                    <span>{{new Date(msg.created_at).getHours()+":"+(new Date(msg.created_at).getMinutes()<10 ? "0"+new Date(msg.created_at).getMinutes(): new Date(msg.created_at).getMinutes())}}</span>
                </div>
            </div>
        </div>

        <div id="sendmessage">
          <img src="../../assets/img.png" class="img" id="upload-img">
        	<input type="text" v-model="inputText" placeholder="请输入" v-on:keyup.enter="handleClickSend"/>
            <button id="send" @click="handleClickSend">发送</button>
        </div>

    <!-- <img :src="profile==null?'':profile.avatar" class="floatingImg"> -->
    <!--<template v-if="profile==null?false:true">-->
      <!--<div v-if="profile.avt==''?true:false" class="text-avatar-chat floatingImg">{{profile.nick.substring(0,1)}}</div>-->
      <!--<img v-if="profile.avt==''?false:true" :src="profile.avt" class="floatingImg"/>-->
    <!--</template> -->
    </div>

</div>
</template>

<script>
import { scrollBottom } from "../../help";
import { UploaderBuilder, Uploader } from "qiniu4js";
import config from "../../config";

export default {
  name: "chat",
  props: ["contacts", "newMsg", "sendMsg", "loadHistory", "currentUser"],
  data() {
    return {
      to: this.$route.params.toUser,
      inputText: ""
    };
  },
  methods: {
    handleScroll: function() {
      let chatMessages = document.getElementById("chat-messages");
      if (chatMessages.scrollTop == 0) {
        this.loadHistory(this.currentUser.userId, this.to);
      }
    },
    goToContacts: function() {
      this.$router.push({
        name: "ContactList",
        params: {
        }
      });
    },
    handleClickSend: function() {
      this.sendMsg({
        type: "im",
        contentType: "text",
        content: this.inputText,
        from: this.currentUser.userId,
        to: this.to
      });
      this.inputText = "";
    },
    addUploadEvent: function() {
      let from = this.currentUser.userId;
      let to = this.to;
      let sendMsg = this.sendMsg;
      // 更多配置，参考https://github.com/lsxiao/qiniu4js
      let uploader = new UploaderBuilder()
        .debug(false) //开启debug，默认false
        // .button('uploadButton')//指定上传按钮
        .retry(0) //设置重传次数，默认0，不重传
        .auto(true) //选中文件后立即上传，默认true
        .multiple(true) //是否支持多文件选中，默认true
        // .accept(["image/*"]) //过滤文件，默认无，详细配置见http://www.w3schools.com/tags/att_input_accept.asp
        .tokenShare(true)
        // 设置token获取URL：客户端向该地址发送HTTP GET请求, 若成功，服务器端返回{"uptoken": 'i-am-token'}。
        .tokenUrl(config.qiniu.fetchTokenUrl)
        .listener({
          onReady() {
            //该回调函数在图片处理前执行,也就是说task.file中的图片都是没有处理过的
            //选择上传文件确定后,该生命周期函数会被回调。
          },
          onStart() {
            //所有内部图片任务处理后执行
            //开始上传
          },
          onTaskGetKey() {
            //为每一个上传的文件指定key,如果不指定则由七牛服务器自行处理
            return Date.now() + "-" + Math.floor(Math.random() * 10000 + 1);
          },
          onTaskProgress: function() {
            //每一个任务的上传进度,通过`task.progress`获取
          },
          onTaskSuccess(task) {
            //一个任务上传成功后回调
            console.warn(task.key);
            console.warn("up success");
            console.warn(task);
            let content = config.qiniu.domain + task.key;
            let contentType = 'file';
            if(task.file.type == "image/png"){
              contentType = "img"
            }
            let msg = {
              type: "im",
              content: content,
              contentType: contentType,
              from: from,
              to: to
            };
            sendMsg(msg);
          },
          onTaskFail() {
            //一个任务在经历重传后依然失败后回调此函数
          },
          onTaskRetry() {
            //开始重传
          },
          onFinish() {
            //所有任务结束后回调，注意，结束不等于都成功，该函数会在所有HTTP上传请求响应后回调(包括重传请求)。
          }
        })
        .build();

      //你可以自行监听HTML元素的click事件，在回调函数内部打开文件选择窗口
      document
        .getElementById("upload-img")
        .addEventListener("click", function() {
          uploader.chooseFile();
        });
    }
  },
  created: function() {
    this.axios
      .post(`/contacts`, { contactUserId: this.to })
      .then(data => {
        console.warn("create contact", data);
      });
  },
  mounted: function() {
    console.warn("mounted");
    this.addUploadEvent();
  },
  computed: {
    msgList: function msgList() {
      let msgs = [];
      this.contacts.map(item => {
        if (item.userId === this.to) {
          msgs = item.msgs;
        }
      });
      return msgs;
    },
    profile: function profile() {
      let contact;
      this.contacts.map((item, index) => {
        if (item.userId === this.to) {
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
