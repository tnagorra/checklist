import ResourceHintWebpackPlugin from 'resource-hints-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import GitRevisionPlugin from 'git-revision-webpack-plugin';
import StylishPlugin from 'eslint/lib/cli-engine/formatters/stylish';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNested from 'postcss-nested';
import postcssNormalize from 'postcss-normalize';
import StyleLintPlugin from 'stylelint-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import WebpackExtensionManifest from 'webpack-extension-manifest-plugin';
import { config } from 'dotenv';

import pkg from '../package.json';
import getEnvVariables from './env.js';

const dotenv = config({
    path: '.env',
});

const gitRevisionPlugin = new GitRevisionPlugin();

const appBase = process.cwd();
const eslintFile = path.resolve(appBase, '.eslintrc-loader.js');
const appDist = path.resolve(appBase, 'build/');
const appSrc = path.resolve(appBase, 'src/');
const appIndexJs = path.resolve(appBase, 'src/index.tsx');
const backgroundJs = path.resolve(appBase, 'src/background.ts');
const appIndexHtml = path.resolve(appBase, 'public/index.html');
const appIcons = path.resolve(appBase, 'public/icons/');

/* eslint-disable @typescript-eslint/camelcase */
const base = {
    manifest_version: 2,
    short_name: 'Checklist',
    browser_action: {
        default_popup: 'index.html',
    },
    background: {
        scripts: ['background.js'],
    },
    permissions: ['storage'],
    icons: {
        32: 'icons/checklist-32.png',
        64: 'icons/checklist-64.png',
        128: 'icons/checklist-128.png',
    },
    content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self';",
};

const PUBLIC_PATH = '/';

module.exports = (env) => {
    const ENV_VARS = {
        ...dotenv.pared,
        ...getEnvVariables(env),
        REACT_APP_VERSION: JSON.stringify(gitRevisionPlugin.version()),
        REACT_APP_COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
        REACT_APP_BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
    };

    return {
        entry: {
            popup: appIndexJs,
            background: backgroundJs,
        },
        output: {
            path: appDist,
            publicPath: PUBLIC_PATH,
            // sourceMapFilename: 'sourcemaps/[file].map',
            // chunkFilename: 'js/[name].[hash].js',
            filename: '[name].js',
            pathinfo: false,
        },

        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: false,
        },

        mode: 'production',

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    include: appSrc,
                    use: [
                        require.resolve('cache-loader'),
                        require.resolve('babel-loader'),
                        {
                            loader: require.resolve('eslint-loader'),
                            options: {
                                configFile: eslintFile,
                                // NOTE: adding this because eslint 6 cannot find this
                                // https://github.com/webpack-contrib/eslint-loader/issues/271
                                formatter: StylishPlugin,
                            },
                        },
                    ],
                },
                {
                    test: /\.(html)$/,
                    use: [
                        {
                            loader: require.resolve('html-loader'),
                            options: {
                                attrs: [':data-src'],
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    include: appSrc,
                    use: [
                        require.resolve('style-loader'),
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                                modules: {
                                    localIdentName: '[name]_[local]_[hash:base64]',
                                },
                                localsConvention: 'camelCase',
                                sourceMap: true,
                            },
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                ident: 'postcss',
                                plugins: () => [
                                    postcssPresetEnv(),
                                    postcssNested(),
                                    postcssNormalize(),
                                ],
                                sourceMap: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    use: [
                        {
                            loader: require.resolve('file-loader'),
                            options: {
                                name: 'assets/[hash].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': ENV_VARS,
            }),
            new CircularDependencyPlugin({
                exclude: /node_modules/,
                failOnError: false,
                allowAsyncCycles: false,
                cwd: appBase,
            }),
            // NOTE: Remove build folder anyway
            new CleanWebpackPlugin(),
            new CopyPlugin([
                {
                    from: appIcons,
                    to: 'icons/',
                },
            ]),
            new StyleLintPlugin({
                files: ['**/*.css'],
                context: appBase,
            }),
            new HtmlWebpackPlugin({
                template: appIndexHtml,
                filename: './index.html',
                title: 'Checklist',
                chunksSortMode: 'none',
                // NOTE: addons do not need favicons
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].css',
            }),
            new WebpackExtensionManifest({
                config: {
                    base,
                    extend: {
                        name: pkg.name,
                        description: pkg.description,
                        author: pkg.author,
                        version: pkg.version,
                    },
                },
            }),
            new ResourceHintWebpackPlugin(),
        ],
    };
};
