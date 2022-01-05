echo "=> building"
docker --context ecsLocal compose -f ./compose-local.yml build

echo "=> creating"
docker --context ecsLocal compose -f ./compose-local.yml create

echo "=> starting"
docker --context ecsLocal compose -f ./compose-local.yml start

echo "=> attaching logs"
docker --context ecsLocal compose -f ./compose-local.yml logs -f --tail=0
