#!/usr/bin/env sh
# One-time VPS setup: creates a fixed-size disk image, formats it as ext4 and
# mounts it so the Postgres volume can never grow beyond SIZE.
# Run as root before the first `docker compose up`:
#   sudo ./setup-db-volume.sh                # 1G at /var/lib/carnet/pgdata
#   sudo SIZE=2G ./setup-db-volume.sh
set -eu

SIZE="${SIZE:-1G}"
MOUNT_POINT="${MOUNT_POINT:-/var/lib/carnet/pgdata}"
IMAGE="${IMAGE:-/var/lib/carnet/pgdata.img}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

mkdir -p "$(dirname "$IMAGE")" "$MOUNT_POINT"

if [ ! -f "$IMAGE" ]; then
  fallocate -l "$SIZE" "$IMAGE"
  chmod 600 "$IMAGE"
  mkfs.ext4 -q -F "$IMAGE"
  echo "Created $SIZE image at $IMAGE"
fi

if ! grep -q " $MOUNT_POINT " /etc/fstab; then
  echo "$IMAGE $MOUNT_POINT ext4 loop,defaults,nofail 0 2" >> /etc/fstab
  echo "Added $MOUNT_POINT to /etc/fstab"
fi

if ! mountpoint -q "$MOUNT_POINT"; then
  mount "$MOUNT_POINT"
fi

df -h "$MOUNT_POINT"
