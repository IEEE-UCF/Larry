# Larry - IEEE@UCF Discord Bot

A modern Discord bot built with TypeScript, Bun, and Discord.js v14 for the IEEE@UCF community.

## Features

- 🎯 **Slash Commands Only** - Modern Discord interaction system
- 🔐 **Permission System** - 8-level hierarchy from Guest to Administrator
- 💾 **Database Integration** - PostgreSQL with Drizzle ORM
- ⚡ **Fast Runtime** - Powered by Bun for optimal performance
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose
- 📅 **Calendar Integration** - Google Calendar support
- 🔧 **TypeScript** - Full type safety and modern development

## Permission Levels

- **GUEST (0)** - Not in database (unregistered Discord users)
- **MEMBER (1)** - Registered members
- **COMMITTEE_MEMBER (2)** - Member of at least one committee
- **PROJECT_LEAD (3)** - Leads at least one project
- **COMMITTEE_CHAIR (4)** - Chairs at least one committee
- **OFFICER (5)** - Any officer role
- **EXECUTIVE (6)** - Executive roles (chair, vice chair, secretary, treasurer)
- **ADMINISTRATOR (7)** - Full admin access

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime
- PostgreSQL database
- Discord bot token and application ID

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/IEEE-UCF/Larry.git
   cd Larry
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Discord token, client ID, and database URL
   ```

4. **Update configuration**
   Edit `src/config.ts` with your server IDs, channel IDs, and other settings.

5. **Start development server**
   ```bash
   bun run dev
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   bun run docker:logs
   ```

3. **Stop the bot**
   ```bash
   bun run docker:down
   ```

## Project Structure

```
src/
├── commands/           # Slash commands organized by category
│   └── general/       # General commands (ping, etc.)
├── events/            # Event listeners (ready, interactionCreate)
├── modules/
│   ├── permissions/   # Permission system
│   ├── database/      # Database integration and schemas
│   ├── helpers/       # Utility classes (Logger, Utils)
│   └── calendar/      # Calendar integration
└── structs/
    ├── Larry.ts       # Main bot client
    ├── SlashCommand.ts # Base command class
    └── Event.ts       # Base event class
```

## Creating Commands

Create a new slash command by extending the `SlashCommand` class:

```typescript
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../structs/SlashCommand.js';
import { PermissionLevel } from '../../modules/permissions/PermissionLevel.js';

export class ExampleCommand extends SlashCommand {
    constructor(client: any) {
        super(client, {
            name: 'example',
            description: 'An example command',
            category: 'general',
            permissionLevel: PermissionLevel.MEMBER,
            cooldown: 5,
        });
    }

    async run(interaction: ChatInputCommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setTitle('Example Command')
            .setDescription('This is an example!')
            .setColor('#4CAF50');

        await interaction.reply({ embeds: [embed] });
    }

    command(): SlashCommandBuilder {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}
```

## Creating Events

Create a new event by extending the `Event` class:

```typescript
import { Event } from '../structs/Event.js';

export class ExampleEvent extends Event {
    constructor(client: any) {
        super(client, {
            name: 'guildMemberAdd',
            once: false,
        });
    }

    async run(member: any): Promise<void> {
        console.log(`${member.user.tag} joined the server!`);
    }
}
```

## Available Scripts

- `bun run start` - Start the bot in production mode
- `bun run dev` - Start with file watching for development
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run docker:build` - Build Docker image
- `bun run docker:up` - Start with Docker Compose
- `bun run docker:down` - Stop Docker containers
- `bun run docker:logs` - View Docker logs

## Configuration

The bot configuration is located in `src/config.ts`. Key settings include:

- Discord token and client ID
- Server and channel IDs
- Database connection string
- Calendar URLs
- Owner information
- Debug mode

## Database Schema

The bot uses PostgreSQL with Drizzle ORM. Key tables include:

- `members` - IEEE member information
- `committees` - Committee data
- `projects` - Project information
- `committee_members` - Many-to-many committee membership
- `project_members` - Many-to-many project membership

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or questions, contact the IEEE@UCF Software Committee or open an issue on GitHub.
