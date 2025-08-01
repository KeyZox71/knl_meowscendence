# knl_meowscendence
Press F to pay respect

## Folder structure
```
├── docker/                  # Docker-related setup for services
│   ├── api-base/            # Backend API base image and compose file
│   ├── front/               # Frontend image, config, and cert automation
│   ├── monitoring/          # Monitoring stack: Prometheus, Grafana, exporters
│   ├── networks.yml         # Docker network definitions
│   └── volumes.yml          # Docker volume definitions
├── src/                     # Application source code
│   ├── api/                 # Backend logic (auth, user management)
│   ├── front/               # Frontend files
│   └── utils/               # Utility modules (auth, TOTP, etc.)
├── flake.nix & flake.lock   # Nix flake configuration
└── Justfile                 # Task automation commands
```
## Modules done

5 major + 2 minor = 6 full modules

- **Web**
  - [x] Use a framework to build the backend.(node with Fastify) - Major
  - [ ] Use a framework or toolkit to build the front-end.(Tailwind CSS) - Minor
  - [x] Use a database for the backend -and more.(SQLite) - Minor
  - [x] Store the score of a tournament in the Blockchain.(Soldity on Avalanche) - Major
- **User Management**
  - [ ] Standard user management, authentication and users across tournaments. - Major
  - [x] Implement remote authentication. - Major
- **Gameplay and user experience**
  - [ ] Remote players - Major
  - [ ] Multiplayer - Major
  - [ ] Add another game - Major
  - [ ] Game customization options - Minor
  - [ ] Live chat - Major
- **AI-Algo**
  - [ ] AI opponent - Major
  - [ ] User and game stats dashboards - Minor
- **Cybersecurity**
  - [ ] WAF/ModSecurity and Hashicorp Vault - Major
  - [ ] RGPD compliance - Minor
  - [x] 2FA and JWT - Major
- **DevOps**
  - [x] Infrasctructure setup for log management - Major
  - [x] Monitoring system - Minor
  - [x] Designing the backend in micro-architecture - Major
- **Graphics**
  - [ ] Use of advanced 3D techniques - Major
- **Accessibility**
  - [ ] Support on all devices - Minor
  - [ ] Expanding Browser compatibility - Minor
  - [ ] Multiple language support - Minor
  - [ ] Add accessibility for visually impaired users - Minor
  - [ ] Server-Side Rendering (SSR) integration - Minor
- **Server-Side Pong**
  - [ ] Replace basic pong with server-side pong and implementing an API - Major
  - [ ] Enabling pong gameplay via CLI against web users with API integration - Major


## License
This project is under [MIT License](LICENSE)
