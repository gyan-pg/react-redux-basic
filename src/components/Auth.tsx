import React, { useState } from 'react';
import styles from './Auth.module.css';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../features/userSlice';
import { auth, provider, storage } from '../firebase';

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Grid,
  Typography,
  makeStyles,
  Modal,
  IconButton,
  Box,
} from "@material-ui/core"

import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Auth:React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {// !はNon-null assertion operatorといい、nullではないことをコンパイラに通知する。付けないとエラーになる。
      setAvatarImage(e.target.files![0]);
      e.target.value = "";// 同じファイルを連続して選択すると反応しなくなる。初期化をすることで、onChangeが反応するようにする。
    }
  };

  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    let url = "";
    // firebase上に画像をアップロードする。
    if (avatarImage) {
      // ランダムなファイル名を作成する。別関数で定義で良いかも。
      const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = `${randomChar}_${avatarImage.name}`;

      await storage.ref(`avatars/${fileName}`).put(avatarImage);
      url = await storage.ref('abatars').child(fileName).getDownloadURL();// 保存先のurlが返却される。
    }
    /**
     * obj.val?.prop : オプショナルチェーンという書き方
     * https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Optional_chaining
     */
    await authUser.user?.updateProfile({
      displayName: username,
      photoURL: url,
    });
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  const signInGoogle = async () => {
    await auth.signInWithPopup(provider).catch((err) => alert(err.message));
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isLogin ? "Login" : "Register"}
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                  ? async () => {
                    try {
                      await signInEmail();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                  : async () => {
                    try {
                      await signUpEmail();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
              }
            >
              {isLogin ? "Login" : "register"}
            </Button>

            <Grid container>
              <Grid item xs>
                <span className={styles.login_reset}>Forgot Password?</span>
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create new account?" : "Back to Login"}
                </span>
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={signInGoogle}
            >
              Sign In with Google
            </Button>

          </form>
        </div>
      </Grid>
    </Grid>
  );
}
export default Auth;
