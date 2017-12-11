import Vue from 'vue';
import Router from 'vue-router';
import Chat from '@/route/chat';
import ContactList from '@/route/contactList';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ContactList',
      component: ContactList,
    },
    {
      path: '/chat/to/:toUser',
      name: 'Chat',
      component: Chat,
    },
  ],
});
