const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    "entry": "./src/renderer.js",
    "output": {
        "path": path.resolve(__dirname, "dist"),
        "filename": "renderer.bundle.js",
    },
    "module": {
        "rules": [
            {
                "test": /\.jsx?$/,
                "exclude": /node_modules/,
                "use": "babel-loader",
            },
            {
                "test": /\.css$/,
                "use": [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                ],
            },
        ],
    },
    "resolve": {
        "extensions": [".js", ".jsx"],
    },
    "plugins": [
        new HtmlWebpackPlugin({
            "template": "public/index.html",
        }),
    ],
    "devServer": {
        "static": "./dist",
        "hot": true,
        "port": 3000,
    },
    "target": "web",
    "mode": "development",
};
