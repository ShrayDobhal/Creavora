const PROFILE_INCLUDE = {
  _count: {
    select: {
      followers: { where: { follower: { is: { deletedAt: null } } } },
      following: { where: { following: { is: { deletedAt: null } } } },
      posts: { where: { deletedAt: null } },
    },
  },
};

const PROFILE_NOT_FOUND = "Profile not found";
const INVALID_PROFILE_MEDIA = "Invalid profile media";

const profileNotFound = () => {
  throw new Error(PROFILE_NOT_FOUND);
};

const presentProfile = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  handle: user.handle,
  bio: user.bio,
  avatar: user.avatar,
  coverImage: user.coverImage,
  roleTitle: user.roleTitle,
  location: user.location,
  address: user.address,
  website: user.website,
  profileVisibility: user.profileVisibility,
  counts: {
    followers: user._count?.followers ?? 0,
    following: user._count?.following ?? 0,
    posts: user._count?.posts ?? 0,
  },
});

async function findActiveProfile(database, userId) {
  const user = await database.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: PROFILE_INCLUDE,
  });
  if (!user) profileNotFound();
  return user;
}

async function assertOwnedMedia(database, userId, url) {
  const asset = await database.mediaAsset.findFirst({
    where: { ownerId: userId, publicUrl: url, deletedAt: null, verifiedAt: { not: null } },
    select: { id: true },
  });
  if (!asset) throw new Error(INVALID_PROFILE_MEDIA);
}

export async function getCurrentProfile(database, userId) {
  return presentProfile(await findActiveProfile(database, userId));
}

export async function updateCurrentProfile(database, userId, input) {
  await findActiveProfile(database, userId);

  for (const field of ["avatar", "coverImage"]) {
    if (input[field]) await assertOwnedMedia(database, userId, input[field]);
  }

  const result = await database.user.updateMany({
    where: { id: userId, deletedAt: null },
    data: input,
  });
  if (result.count === 0) profileNotFound();

  return getCurrentProfile(database, userId);
}

export { INVALID_PROFILE_MEDIA, PROFILE_NOT_FOUND };
