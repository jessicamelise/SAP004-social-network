import { firebaseActions, oneLikePerUser } from '../../../data.js';
import { menuFixed } from '../menu/menufixed.js';
import { createElementPost } from './createPost.js';

function updateLikeDOM(like, postId) {
  const postElement = document.getElementById(`post-${postId}`);
  const likeValueElement = postElement.getElementsByClassName('like-value')[0];
  likeValueElement.innerHTML = like;
}

export const postsFunc = {
  loggoutMenuEvent() {
    const loggoutButton = document.querySelector('#loggout');
    loggoutButton.addEventListener('click', () => {
      firebaseActions.loggoutData();
    });
    const menuBar = document.querySelector('#bar-menu');
    menuBar.addEventListener('click', () => {
      loggoutButton.classList.toggle('show-loggout');
    });
  },
  editPostDOM(postId) {
    const element = document.getElementById(`post-${postId}`);
    const textEditElement = element.getElementsByClassName('post-text-area')[0];

    if (textEditElement.contentEditable !== 'true') {
      textEditElement.contentEditable = true;
      textEditElement.focus();
    } else {
      textEditElement.contentEditable = false;
      firebaseActions.editOrLikePost(postId, { text: textEditElement.textContent });
    }
  },
  deletePostDOM(postId) {
    firebaseActions.deletePost(postId);
    const post = document.getElementById(`post-${postId}`);
    post.remove();
  },
  likePostDOM(postId, element) {
    const postElement = document.getElementById(`post-${postId}`);
    const likeValueElement = postElement.getElementsByClassName('like-value')[0];
    const likes = Number(likeValueElement.textContent);
    oneLikePerUser(postId, likes, updateLikeDOM, element);
  },
};

function editHoursPosted(dateInfo) {
  return dateInfo < 10 ? `0${dateInfo}` : dateInfo;
}

export function getHoursPosted() {
  const date = new Date();
  return `${editHoursPosted(date.getDate())}/${editHoursPosted(date.getMonth() + 1)}
  /${editHoursPosted(date.getFullYear())} 
  ${editHoursPosted(date.getHours())}:${editHoursPosted(date.getMinutes())}
  :${editHoursPosted(date.getSeconds())}`;
}

function readPostsDOM(post) {
  document.querySelector('#postados').prepend(createElementPost(post));
}

function postDOM() {
  const postar = document.querySelector('#postar');
  const postTexto = document.querySelector('#post-text');
  const img = document.querySelector('#post-img');
  const inputFile = document.querySelector('#input-file');
  const privateField = document.querySelector('#private');

  img.addEventListener('click', () => {
    inputFile.click();
  });

  postar.addEventListener('click', (event) => {
    event.preventDefault();
    const post = {
      text: postTexto.value,
      id_user: firebase.auth().currentUser.uid,
      name: firebase.auth().currentUser.displayName,
      likes: 0,
      private: true,
      visibility: privateField.checked ? 'private' : 'public',
      date: getHoursPosted(),
      wholiked: [],
    };
    postTexto.value = '';
    privateField.checked = false;
    firebaseActions.postData(post, readPostsDOM);
  });
}

function pagePost() {
  document.getElementById('postados').innerHTML = '';
  firebaseActions.readPosts(readPostsDOM);
  postDOM();
}

export function initPostsAndMenu(container) {
  menuFixed(container);
  pagePost();
}