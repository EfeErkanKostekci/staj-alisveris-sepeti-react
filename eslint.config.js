import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"], 
        languageOptions: {
            globals: {...globals.browser},
            ecmaVersion: 2020,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {jsx: true}
            }
        }
    },
    {
        plugins: {
            "react-refresh": reactRefresh,
            "react-hooks": reactHooks
        },
        rules: {
            "react-refresh/only-export-components": ["warn", {allowConstantExport: true}],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn"
        }
    },
    prettierConfig
]