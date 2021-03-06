import { firebaseActions } from '../../../data.js';
import { postsFunc } from './mainposts.js';
import { printComments } from '../comments/commentsTemplate.js';
import { menuFixed } from '../menu/menufixed.js';


export function clearArea(element) {
  const elementArea = element;
  elementArea.getElementsByClassName('comment-area')[0].innerHTML = '';
}
export function clearAreaPosts() {
  document.getElementById('post-main-area').innerHTML = '';
}

export function commentsDOM(postId, postOwner, element) {
  const textPosted = element.getElementsByClassName('comment-input-area')[0];
  const postCommentButton = element.getElementsByClassName('post-button')[0];
  textPosted.addEventListener('keydown', () => {
    if (textPosted.value.length > 0) {
      postCommentButton.disabled = false;
    } else {
      postCommentButton.disabled = true;
    }
  });
  postCommentButton.addEventListener('click', () => {
    postCommentButton.disabled = true;
    const post = {
      name: firebase.auth().currentUser.displayName,
      id_user: firebase.auth().currentUser.uid,
      date: new Date().toLocaleString('pt-BR'),
      text: textPosted.value,
      postOwner,
      parentId: postId,
      likes: 0,
      wholiked: [],
    };
    textPosted.value = '';
    firebaseActions.comments(post);
  });
}

function iconPrivateAndPublicPost(postVisibility, element) {
  const elementDiv = element;
  if (postVisibility === 'public') {
    elementDiv.querySelector('.private-icon').innerHTML = `
      <i class="material-icons">public</i>
    `;
  } else {
    elementDiv.querySelector('.private-icon').innerHTML = `
      <i class='fas fa-lock'></i>
    `;
  }
}

function templateImagePost(url, archiveName) {
  document.getElementById('submit-post').disabled = false;
  document.querySelector('.img-preview').innerHTML = `
    <img src='${url}' class='img-posts-preview' id='${archiveName}'>
    <span class='close-img-preview'>X</span>
  `;

  document.getElementsByClassName('close-img-preview')[0].addEventListener('click', () => {
    document.querySelector('.img-preview').innerHTML = '<img src="">';
  });
}

function createElementPost(post) {
  const postTemplate = `
    <div class='name-edit-post'>
      <p class='post-user-name'>${post.data().name}</p>
      <p class='private-icon'>${post.data().visibility}</p>
      <span class='edit'>
          <img src='../../img/edit-regular.svg' alt='edit-posts'>
      </span>
    </div>
    <p class='post-text-area' id='text-${post.id}'>${post.data().text}</p>
    <img src='${post.data().img}' class=${/firebasestorage/i.test(post.data().img) ? 'img-posts' : 'hidden'}>
    <div class='name-edit-post'>
      <span class='display-like'>
        <div class='like'>
          <img class='like-img liked svg-class ${post.data().wholiked.includes(firebase.auth().currentUser.uid) ? '' : 'hidden'}' src='../../img/like-spock.svg' alt='like-button'>
          <img class='like-img   like-back svg-class ${post.data().wholiked.includes(firebase.auth().currentUser.uid) ? 'hidden' : ''}' src='../../img/notliked.svg' alt='like-button'>
        </div>
        <span class='like-value'>${post.data().wholiked.length}</span>
      </span>
      <p class='style-hour'>${post.data().date}</p>
      <span>
        <img class='comment-button' src='../../img/comentario.svg' alt='comment-button'>
        <img class='delete' src='../../img/trash-alt-regular.svg' alt='delete-posts'>
      </span>
    </div>
    <ul>
      <li class='post-comment'>
        <textarea class='comment-input-area input-comment'></textarea>
        <button type='submit' class='post-button width-button-login button-login'>Comentário</button>
      </li>
      <li class='comment-area'></li>
    </ul>
  `;
  const postElement = document.createElement('li');
  postElement.classList.add('each-post');
  postElement.id = `post-${post.id}`;
  postElement.innerHTML = postTemplate;
  postElement.getElementsByClassName('edit')[0].addEventListener('click', () => {
    postsFunc.editPostDOM(post.id);
  });
  postElement.getElementsByClassName('like')[0].addEventListener('click', () => {
    postsFunc.likePostDOM(post.id, postElement);
    postElement.getElementsByClassName('liked')[0].classList.toggle('hidden');
    postElement.getElementsByClassName('like-back')[0].classList.toggle('hidden');
  });
  postElement.getElementsByClassName('delete')[0].addEventListener('click', () => {
    postsFunc.deletePostDOM(post.id);
  });
  postElement.getElementsByClassName('comment-button')[0].addEventListener('click', () => {
    postElement.getElementsByClassName('post-button')[0].disabled = true;
    const comentario = postElement.getElementsByClassName('post-comment')[0];
    comentario.classList.toggle('show');
    commentsDOM(post.id, post.data().id_user, postElement);
  });
  const readCommentsObj = {
    postId: post.id,
    func: printComments,
    element: postElement,
    clear: clearArea,
  };
  firebaseActions.readComments(readCommentsObj);
  if (post.data().id_user !== firebase.auth().currentUser.uid) {
    postElement.querySelector('.delete').classList.add('visibility');
    postElement.querySelector('.edit').classList.add('visibility');
  }
  iconPrivateAndPublicPost(post.data().visibility, postElement);
  return postElement;
}

function readPostsDOM(post) {
  document.querySelector('#post-main-area').prepend(createElementPost(post));
}

function postDOM(element) {
  const submitPost = element.querySelector('#submit-post');
  const postText = element.querySelector('#post-text');
  const img = element.querySelector('#post-img');
  const inputFile = element.querySelector('#input-file');
  const privateField = element.querySelector('#private');
  const imgPreview = element.querySelector('.img-preview');

  postText.addEventListener('keydown', () => {
    if (postText.value.length > 0) {
      submitPost.disabled = false;
    } else {
      submitPost.disabled = true;
    }
  });

  img.addEventListener('click', () => {
    inputFile.click();
    inputFile.addEventListener('change', (event) => {
      submitPost.disabled = true;
      const archive = event.target.files[0];
      firebaseActions.storageImagesUpdate(archive, templateImagePost);
    });
  });

  submitPost.addEventListener('click', (event) => {
    event.preventDefault();
    const post = {
      text: postText.value,
      id_user: firebase.auth().currentUser.uid,
      name: firebase.auth().currentUser.displayName,
      img: imgPreview.children[0].src,
      visibility: privateField.checked ? 'private' : 'public',
      date: new Date().toLocaleString('pt-BR'),
      wholiked: [],
    };
    postText.value = '';
    privateField.checked = false;
    firebaseActions.postData(post, readPostsDOM);
    imgPreview.innerHTML = `
      <img src=''>
    `;
  });
}

function pagePost(element) {
  firebaseActions.readPosts(readPostsDOM, clearAreaPosts);
  postDOM(element);
}

export function initPostsAndMenu(container) {
  menuFixed(container);
  pagePost(container);
}
