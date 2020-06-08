import { routes } from "./routes.js";
import { signIn } from "./pages/posts/posts.js";
const container = document.querySelector("#root");

function init() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      container.innerHTML = "";
      container.appendChild(signIn(firebase.auth().currentUser.displayName));
      const loggoutButton = document.querySelector("#loggout");
      const menuBar = document.querySelector("#bar-menu");
      menuBar.addEventListener("click", () => {
        loggoutButton.classList.toggle("show-loggout");
      })
      loggoutButton.addEventListener("click", () => {
        firebase.auth().signOut();
      });
      document.getElementById("postados").innerHTML = "";
      readPosts();
      post();
    } else if (!user) {
      container.innerHTML = "";
      container.appendChild(routes.home);
      const emailInput = document.querySelector("#email-input");
      const passwordInput = document.querySelector("#password-input");
      const loginButton = document.querySelector("#submit-btn");
      loginButton.addEventListener("click", () => {
        firebase
          .auth()
          .signInWithEmailAndPassword(emailInput.value, passwordInput.value)
          .catch((error) => {
            alert(error.message);
        });
    })
      const registerButton = document.querySelector("#register");
      registerButton.addEventListener("click", () => {
        container.innerHTML = "";
        container.appendChild(routes.register);
        register();
      });

      const googleAuth = document.querySelector("#google");

      googleAuth.addEventListener("click", googleLogin);
    }
  });
}

window.addEventListener("load", () => {
  init();
});

function post() {
  const postar = document.querySelector("#postar");
  const postTexto = document.querySelector("#post-text");
  const img = document.querySelector("#post-img")
  const inputFile = document.querySelector("#input-file")

  img.addEventListener("click", ()=> {
    inputFile.click()
  })


  postar.addEventListener("click", async (event) => {
    event.preventDefault();
    const post = {
      text: postTexto.value,
      id_user: firebase.auth().currentUser.uid,
      name: firebase.auth().currentUser.displayName,
      likes: 0,
      private: true,
      date: getHoursPosted()
    };
    const postCollection = firebase.firestore().collection("posts");

    let posteAdded = await postCollection.add(post);
    let newPost = await posteAdded.get();
    postTexto.value = "";
    
    let postElement = createElementPost(newPost);
    let postadosElement = document.querySelector("#postados")
    postadosElement.prepend(postElement);
  });
}

function getHoursPosted () {
  const date = new Date()
  const fullDate = {
    day: date.getDate()<10?"0"+date.getDate():date.getDate(),
    month: date.getMonth()<10?"0"+date.getMonth():date.getMonth(),
    year: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes(),
    seconds: date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds()
    }
    return `${fullDate.day}/${fullDate.month}/${fullDate.year} as ${fullDate.hours}:${fullDate.minutes}:${fullDate.seconds}`
}

async function readPosts() {
  const postCollection = firebase.firestore().collection("posts").orderBy("date", "desc");
  document.getElementById("postados").innerHTML = "";

  let posts = await postCollection.get()
  posts.forEach((post) => {
    let postElement = createElementPost(post);
    document.querySelector("#postados").appendChild(postElement); 
  });
}

function editPosts() {
  const postCollection = firebase.firestore().collection("posts");

  const editar = document.querySelectorAll(".edit");

  editar.forEach((element) => {
    element.addEventListener("click", (event) => {
      const textEdit = event.currentTarget.parentElement.nextElementSibling;
      textEdit.contentEditable = true;
      textEdit.focus();

      editar.forEach((element) => {
        element.addEventListener("click", (event) => {
          const textEdit = event.currentTarget.parentElement.nextElementSibling;
          textEdit.contentEditable = false;
          const textContent = event.currentTarget.parentElement.nextElementSibling.textContent;
          const postID = event.currentTarget.closest("li").id;
          postCollection.doc(postID).update({ text: textContent });
          readPosts();
        });
      });
    });
  });
}

function deletePosts() {
  const postCollection = firebase.firestore().collection("posts");

  const deletar = document.querySelectorAll(".delete");
  deletar.forEach((element) => {
    element.addEventListener("click", (event) => {
      const postID = event.currentTarget.parentElement.parentElement.id;
      postCollection
        .doc(postID)
        .delete()
        .then(() => {
          document.getElementById("postados").innerHTML = "";
          readPosts();
        });
    });
  });
}


async function deletePost(event, postId) {
  const postCollection = firebase.firestore().collection("posts");
  await postCollection.doc(postId).delete();
  let post = document.getElementById(`post_${postId}`);
  post.remove();
}


async function likePost(event, postId) {
  const postCollection = firebase.firestore().collection("posts");
  let post = await postCollection.doc(postId).get(); 
  let postElement = document.getElementById(`post_${postId}`);
  let likeValueElement = postElement.getElementsByClassName("like-value")[0];
  let likes = post.data().likes + 1;
  await postCollection.doc(postId).update({ likes: likes });
  likeValueElement.innerHTML = likes;
}

async function editPost(event, postId) {
  let postElement = document.getElementById(`post_${postId}`);
  let textEditElement = postElement.getElementsByClassName("post-text-area")[0];

  if (textEditElement.contentEditable != "true") {
    textEditElement.contentEditable = true;
    textEditElement.focus();  
  } else {
    const postCollection = firebase.firestore().collection("posts");
    await postCollection.doc(postId).update({ text: textEditElement.innerHTML });
    textEditElement.contentEditable = false;
  }
}

function likePosts() {
  const postCollection = firebase.firestore().collection("posts");

  const likeButton = document.querySelectorAll("like");

  likeButton.forEach((element) => {
    element.addEventListener("click", (event) => {
      const postID = event.currentTarget.closest("li").id;
      const likeNextElement = Number(event.currentTarget.nextElementSibling.textContent) + 1;
      postCollection.doc(postID).update({ likes: likeNextElement });
      readPosts();
    });
  });
}


function createElementPost(post) {
  const postTemplate = `
      <div class="name-edit-post">
        <p class="post-user-name">${post.data().name}</p>
        <span class="edit">
          <img src="img/edit-regular.svg" alt="edit-posts">
        </span>
      </div>
      <p class="post-text-area" id='text-${post.id}'>${post.data().text}</p>
      <div class="name-edit-post">
        <div>
          <span class="like">❤️</span>
          <span class="like-value">${post.data().likes}</span> 
        </div>
        <p> Postado em: ${post.data().date}</p>
        <span class="delete">
          <img src="img/trash-alt-regular.svg" alt="delete-posts">
        </span>
      </div>
  `;
  let postElement = document.createElement("li");
  postElement.classList.add("each-post")
  postElement.id = `post_${post.id}`
  postElement.innerHTML = postTemplate;
  postElement.getElementsByClassName("edit")[0].addEventListener("click", async (event) => {
    await editPost(event, post.id);
  });
  postElement.getElementsByClassName("like")[0].addEventListener("click", async (event) => {
    await likePost(event, post.id);
  });
  postElement.getElementsByClassName("delete")[0].addEventListener("click", async (event) => {
    await deletePost(event, post.id);
  });
  return postElement;
}

function register() {
  const emailRegisterInput = document.querySelector("#email-input-register");
  const nameRegisterInput = document.querySelector("#name-input-register");
  const dateRegisterInput = document.querySelector("#date-input-register");
  const passwordRegisterInput = document.querySelector("#password-input-register");
  const singInButton = document.querySelector("#sign-in-button");
  const backButton = document.querySelector("#back-button");

  backButton.addEventListener("click", () => {
    container.innerHTML = '';
    container.appendChild(routes.home);
  })

  singInButton.addEventListener("click", () => {
    const userCollection = firebase.firestore().collection("users-info");

    firebase
      .auth()
      .createUserWithEmailAndPassword(
        emailRegisterInput.value,
        passwordRegisterInput.value
      )
      .then((cred) =>
        cred.user.updateProfile({ displayName: nameRegisterInput.value })
      )
      .then(() => {
        const uid = firebase.auth().currentUser.uid;
        userCollection.add({
          name: nameRegisterInput.value,
          email: emailRegisterInput.value,
          birthday: dateRegisterInput.value,
          id_user: uid,
        });
      })
      .catch((error) => {
        alert(error.message);
    });
  });
}

function googleLogin() {
  let provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      let token = result.credential.accessToken;
      // The signed-in user info.
      let user = result.user;
      // ...
    })
    .catch(function (error) {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      // The email of the user's account used.
      let email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      let credential = error.credential;
      // ...
    });
}
