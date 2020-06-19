import { firebaseActions, oneLikePerUser } from "../../../data.js";

function updateLikeDOM(like, postId) {
  const postElement = document.getElementById(`post-${postId}`);
  const likeValueElement = postElement.getElementsByClassName("like-value")[0];
  likeValueElement.innerHTML = like;
}

export const postsFunc = {
  loggoutMenuEvent() {
    const loggoutButton = document.querySelector("#loggout");
    loggoutButton.addEventListener("click", () => {
      firebaseActions.loggoutData();
    });
    const menuBar = document.querySelector("#bar-menu");
    menuBar.addEventListener("click", () => {
      loggoutButton.classList.toggle("show-loggout");
    });
  },
  editPostDOM(postId) {
    const element = document.getElementById(`post-${postId}`);
    let textEditElement = element.getElementsByClassName("post-text-area")[0];
    const popup = document.getElementById("popup");
    popup.innerHTML ='';
    popup.classList.remove("popup-none");
    popup.classList.add("popup");
    let editAreaPopUp = `<h1>Título</h1>
    <p id='text-area'>${textEditElement.textContent}</p>
    <button id='save'>Salvar</button>`;
    popup.innerHTML = editAreaPopUp;
    let textArea = document.getElementById("text-area");
    const buttonSave = document.getElementById("save");
    if (textArea.contentEditable !== "true") {
      textArea.contentEditable = true;
      textArea.focus();
    } else {
      textArea.contentEditable = false;
    }

    buttonSave.addEventListener("click", () => {
      textEditElement.textContent = textArea.textContent;

      firebaseActions.editOrLikePost(postId, {
        text: textEditElement.textContent,
      });
      popup.classList.remove("popup");
      popup.classList.add("popup-none");
    });
  },
  deletePostDOM(postId) {
    firebaseActions.deletePost(postId);
    const post = document.getElementById(`post-${postId}`);
    post.remove();
  },
  likePostDOM(postId, element) {
    const postElement = document.getElementById(`post-${postId}`);
    const likeValueElement = postElement.getElementsByClassName(
      "like-value"
    )[0];
    const likes = Number(likeValueElement.textContent);
    oneLikePerUser(postId, likes, updateLikeDOM, element);
  },
};
