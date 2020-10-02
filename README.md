# card-game-simulator

カードゲームシミュレーター

# How to get started

VSCode の[Remote Container 拡張](https://code.visualstudio.com/docs/remote/containers)の使用を推奨します．  
このプロジェクトをクローンし，VSCode の[Remote Container 拡張](https://code.visualstudio.com/docs/remote/containers)を使用して開く．

```
git clone https://github.com/2d-rpg/card-game-simulator.git
code card-game-simulator
```

以下 Docker コンテナ上で実行

```
yarn install --frozen-lockfile
expo start --tunnel
```

Android, iOS の場合は Expo アプリから表示される QR コードを読みとる．  
Web の場合は w キーを押すと表示される URL からブラウザで開く．  
この状態でコードを変更するとアプリ，ブラウザ上でも変更が即座に適用されます．
