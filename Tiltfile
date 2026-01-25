# MODE = "development" or "production"
MODE = os.getenv("MODE", "development")


# -----------------------------------------
# Choose the docker compose file
# -----------------------------------------
if MODE == "production":
    docker_compose('compose.prod.yml')
    print('Starting App in production mode...')
else:
    docker_compose('compose.dev.yml')
    print('Starting App in development mode...')

SERVICES = {
  'gateway': './apps/api-gateway',
  'authz': 'apps/authz',
  'channel': './apps/channel',
  'comments': './apps/comments',
  'email': './apps/email',
  'history': './apps/history',
  'playlist': './apps/playlist',
  'reaction': './apps/reaction',
  'read': './apps/read',
  'subscribe': './apps/subscribe',
  'users': './apps/users',
  'video-transcoder': './apps/video-transcoder',
  'videos': './apps/videos',
  'views': './apps/views',
}

# -----------------------------------------
# Build fns
# -----------------------------------------
def start_services_development(name, rel_path):
    image_name = "mytube/" + name + "/development"

    prisma_generate_command = 'npx prisma generate --schema apps/' + name + '/prisma/schema.prisma'
    prisma_schema = '/@streamforge/apps/' + name + '/prisma/schema.prisma'

    docker_build(
        image_name,
        '.',
        dockerfile = rel_path + '/Dockerfile',
        target='development',
        live_update=[
            sync(rel_path, "/@streamforge/apps/" + name),
            sync("./libs", "/libs"),
            run("yarn install", trigger=["package.json", "yarn.lock"]),
            run(prisma_generate_command, trigger=[prisma_schema]),
        ]
    )

def start_services_production(name, rel_path):
    image_name = "mytube/" + name + "/production"

    docker_build(
        ref=image_name,
        context='.',
        dockerfile=rel_path + "/Dockerfile",
        target="production"
    )

# -----------------------------------------
# Start all services
# -----------------------------------------
for name, path in SERVICES.items():
    if MODE == "production":
        start_services_production(name, path)
    else:
        start_services_development(name, path)
