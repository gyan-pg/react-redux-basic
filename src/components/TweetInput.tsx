import React,{useState} from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, storage,db } from "../firebase";
import { Avatar,Button,IconButton } from "@material-ui/core";
import firebase from "firebase/app";
import { AddPhotoAlternate } from "@material-ui/icons";

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);// userSliceのstateを参照
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState("");

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {// !はNon-null assertion operatorといい、nullではないことをコンパイラに通知する。付けないとエラーになる。
      setTweetImage(e.target.files![0]);
      e.target.value = "";// 同じファイルを連続して選択すると反応しなくなる。初期化をすることで、onChangeが反応するようにする。
    }
  };
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = `${randomChar}_${tweetImage.name}`;
      // uploadTweetImgにはstorage.ref()の返り値が代入される。
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      // .onメソッドで、storageに対してstateの変化があった際に行える後処理を書ける。
      // 1.アップロードの進捗管理
      // 2.エラーハンドリング
      // 3.正常終了後の処理
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err) => {
          alert(err.message)
        },
        // 正常終了した場合は、保存した画像のパスをとる。
        async () => {
          await storage
            .ref("images")
            .child(fileName)
            .getDownloadURL()
            .then(
              // 保存先のデータをdbに保存する。
              async (url) => {
                await db.collection("posts").add({
                  avatar: user.photoUrl,
                  image: url,
                  text: tweetMsg,
                  timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  username: user.displayName
                });
              });
        }
      );

    } else {
      db.collection("posts").add({
        avatar: user.photoUrl,
        image: "",
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    setTweetImage(null);
    setTweetMsg("");
  }

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            className={styles.tweet_input}
            placeholder="What's happening?"
            type="text"
            autoFocus
            value={tweetMsg}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTweetMsg(e.target.value)}
          />
          <IconButton>
            <label>
              <AddPhotoAlternate
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                className={styles.tweet_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
