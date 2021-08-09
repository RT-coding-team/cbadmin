const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        main:'./src/js/index.js',
        admin:'./src/js/admin.js',
        login:'./src/js/login.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: [
                    /node_modules[\/]core-js/,
                    /node_modules[\/]webpack[\/]buildin/,
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        targets: {
                            chrome: "4",
                            ie: "11"
                        }
                    }
                }
            },
            {
                test: /\.module\.s[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        }
                    },
                    {
                        loader: 'sass-loader',
                    }
                ]

            },
            {
                test: /\.s[ac]ss$/,
                exclude: /\.module.(s[ac]ss)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        environment: {
            arrowFunction: false,
        },
    },
    mode: "production"
};