import React, { useEffect } from 'react';
import styles from './App.module.css';
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Feed from './components/Feed';
import Auth from './components/Auth';

const App: React.FC = () => {
  
  const user = useSelector(selectUser);// useSelectorはReduxストアのステートにアクセスするのフック。
  const dispatch = useDispatch();// Reduxのdispatch関数にアクセスするフック。

  useEffect(() => {
    // onAuthStateChangedは一度実行すると、ユーザーの変化の監視を始める。
    // 戻り値は監視をやめるための関数なので、監視をやめる場合はその関数を実行する。この場合はunSub()
    const unSub = auth.onAuthStateChanged((authUser) => {// authUser(変数名はなんでも良い)は変化後のユーザー情報が入ってくる。
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName
          })
        );
      } else {
        dispatch(logout());
      }
    });
    // クリーンアップ関数はAppコンポーネントが破棄される時に実行される。
    return () => {
      unSub();
    };
  }, [dispatch])

  return (
    <>
      { user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
}

export default App;
