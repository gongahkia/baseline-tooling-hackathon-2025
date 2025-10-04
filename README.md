# GroundWork

A comprehensive VSCode extension that integrates Baseline web feature compatibility data into the developer workflow, solving the problem of uncertainty around modern web feature adoption.

## 🚀 Features

### Real-Time Compatibility Checking
- **Automatic Detection**: Parse HTML, CSS, and JavaScript files for web platform features
- **Baseline Integration**: Match detected features against Baseline data
- **Visual Indicators**: Display status indicators (Limited/Newly/Widely available) via decorations
- **Smart Warnings**: Show warnings for features not meeting project targets

### Progressive Enhancement Advisor
- **Feature Detection**: Detect usage of newly available features
- **Code Suggestions**: Suggest progressive enhancement patterns
- **Fallback Recommendations**: Provide code snippets for feature detection
- **Best Practices**: Recommend fallback implementations

### Rich Hover Information
- **Contextual Tooltips**: Rich hover tooltips showing Baseline status, support dates, browser versions
- **Documentation Links**: Links to MDN documentation and specifications
- **Usage Recommendations**: Recommendations based on project settings

### Project Configuration
- **Settings Panel**: Define browser support targets
- **Team Configuration**: Support for `.baseline-config.json` files
- **Browserslist Integration**: Integrate with existing browserslist configuration

### Build Tool Integration
- **Webpack Plugin**: Build-time compatibility checking
- **Vite Plugin**: Modern build system support
- **Compatibility Reports**: Generate detailed reports during build process

### CI/CD Integration
- **GitHub Actions**: Automated compatibility checking
- **PR Comments**: Pull request comments with compatibility analysis
- **Deployment Gates**: Prevent deployment of incompatible code

## 📦 Installation

### VSCode Extension

1. Install from the VSCode Marketplace (coming soon)
2. Or install from source:
   ```bash
   git clone https://github.com/your-org/baseline-aware-dev-assistant.git
   cd baseline-aware-dev-assistant
   npm install
   npm run compile
   ```

### Build Tool Plugins

#### Webpack Plugin
```bash
npm install baseline-webpack-plugin
```

```javascript
const BaselineWebpackPlugin = require('baseline-webpack-plugin');

module.exports = {
  plugins: [
    new BaselineWebpackPlugin({
      failOnError: true,
      reportPath: 'baseline-report.json'
    })
  ]
};
```

#### Vite Plugin
```bash
npm install baseline-vite-plugin
```

```javascript
import { defineConfig } from 'vite';
import { baselineVitePlugin } from 'baseline-vite-plugin';

export default defineConfig({
  plugins: [
    baselineVitePlugin({
      failOnError: true,
      reportPath: 'baseline-report.json'
    })
  ]
});
```

## 🛠️ Configuration

### VSCode Settings

Configure the extension through VSCode settings:

```json
{
  "groundwork.browserSupport": ["chrome 90", "firefox 88", "safari 14"],
  "groundwork.warningLevel": "warning",
  "groundwork.autoCheck": true,
  "groundwork.cacheDuration": 3600
}
```

### Project Configuration

Create a `.baseline-config.json` file in your project root:

```json
{
  "browserSupport": [
    "chrome 90",
    "firefox 88", 
    "safari 14",
    "edge 90"
  ],
  "warningLevel": "warning",
  "autoCheck": true,
  "cacheDuration": 3600,
  "excludePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "*.min.js",
    "*.min.css"
  ],
  "teamSettings": {
    "notifyOnNewFeatures": true,
    "requireApprovalForLimited": true,
    "autoUpdateBaseline": true
  }
}
```

## 🎯 Usage

### VSCode Extension

1. **Automatic Checking**: The extension automatically checks files as you type
2. **Manual Checking**: Use `Ctrl+Shift+P` and run "GroundWork: Check Compatibility"
3. **Dashboard**: View the compatibility dashboard in the sidebar
4. **Hover Information**: Hover over web features for detailed information

### Command Palette Commands

- `GroundWork: Check Compatibility` - Check current file for compatibility issues
- `GroundWork: Show Dashboard` - Open the compatibility dashboard
- `GroundWork: Refresh Data` - Refresh Baseline data from API
- `GroundWork: Configure Project` - Configure project settings

### Build Integration

The build plugins automatically check your code during the build process and generate compatibility reports.

## 📊 Supported Features

### HTML Features
- Dialog Element
- Details/Summary Elements
- Template Element
- Slot Element
- Picture Element
- Video/Audio Elements
- Canvas Element
- SVG Element

### CSS Features
- Grid Layout
- Flexbox
- Custom Properties (Variables)
- Container Queries
- Subgrid
- @supports
- Media Queries (prefers-color-scheme, prefers-reduced-motion)
- Backdrop Filter
- Clip Path
- Mask
- Shape Outside
- Object Fit
- Filter
- Transform
- Transition
- Animation

### JavaScript Features
- Optional Chaining
- Nullish Coalescing
- Async/Await
- Destructuring Assignment
- Spread Operator
- Arrow Functions
- ES6 Classes
- ES6 Modules
- Promises
- Fetch API
- Local/Session Storage
- Event Listeners
- Query Selector

## 🔧 Development

### Prerequisites
- Node.js 18+
- TypeScript 4.9+
- VSCode 1.74+

### Setup
```bash
git clone https://github.com/your-org/baseline-aware-dev-assistant.git
cd baseline-aware-dev-assistant
npm install
npm run compile
```

### Testing
```bash
npm test
```

### Building
```bash
npm run compile
npm run package
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Web Platform Dashboard](https://web-platform-dashboard.vercel.app/) for Baseline data
- [MDN Web Docs](https://developer.mozilla.org/) for documentation
- [Can I Use](https://caniuse.com/) for browser support data
- [Browserslist](https://browserslist.dev/) for browser support queries

## 📞 Support

- 📧 Email: support@baseline-tooling.dev
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/baseline-aware-dev-assistant/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/baseline-aware-dev-assistant/discussions)

## 🗺️ Roadmap

- [ ] VS Code for Web compatibility
- [ ] Integration with other IDEs (Vim, Emacs)
- [ ] Browser extension for web-based development
- [ ] Mobile app for quick feature lookups
- [ ] CLI tool for headless analysis
- [ ] Integration with more build tools (Rollup, Parcel)
- [ ] Team collaboration features
- [ ] Custom feature definitions
- [ ] Performance monitoring integration

---

**Built for the Baseline Tooling Hackathon 2025** 🏆