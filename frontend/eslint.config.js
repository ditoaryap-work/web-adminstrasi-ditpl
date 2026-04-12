import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  {
    ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**', 'eslint.config.js', 'postcss.config.js', 'tailwind.config.js', 'vite.config.ts']
  },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    }
  }
]
