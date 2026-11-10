import type { IslandId } from './world'

/**
 * Photos for each world (Unsplash License, free photos only). No identifiable people, no logos or brand marks
 * (the wrestling set's first photo is the client-supplied image). The first photo of each world is its cover.
 * Each question card shows the next photo in the set, so a quest cycles through them.
 */
export interface Pic {
  /** Unsplash image id ("photo-…"), or a local file */
  id?: string
  local?: string
  credit: string
  /** what the photo shows (for the photo library and alt text) */
  about?: string
}

const u = (id: string, credit: string, about = ''): Pic => ({ id, credit, about })

export const WORLD_PHOTOS: Record<IslandId, Pic[]> = {
  football: [
    u('photo-1617144519956-bba853571334', 'Ben Hershey', 'A football on its own on grass'),
    u('photo-1635272340267-84d197fe6ded', 'Mike Cho', 'Overhead view of a pitch and goal'),
    u('photo-1566920989005-c4c3e239c12c', 'Simon Godfrey', 'Yellow football on a pitch'),
    u('photo-1783428894800-5b380043957e', 'Bohdan Hyrovych', 'Ball flying towards a goal net'),
    u('photo-1729843352938-0e10fbf96585', 'Charles Kitenge', 'Aerial view of a stadium pitch'),
    u('photo-1599204606350-d7fb87de75f6', 'Janosch Jost', 'White and orange ball on grass'),
    u('photo-1706675780107-7c43cc487928', 'Alex Simpson', 'A match in a stadium at night, seen from the stands'),
    u('photo-1635272024672-aaf4810e2f47', 'Mike Cho', 'Aerial view, ball in the middle of the pitch'),
    u('photo-1783428924759-d5c97dc8dc5c', 'Bohdan Hyrovych', 'Ball on a pitch with goals'),
    u('photo-1540379708242-14a809bef941', 'Pascal Müller', 'Green football pitch'),
    u('photo-1665680674724-3a3b3368e036', 'Jelly Dollar', 'Golden trophies'),
  ],
  wrestling: [
    { local: '/worlds/wrestling.jpg', credit: 'Supplied by client', about: 'Client-supplied wrestling image (cover)' },
    u('photo-1575747515871-2e323827539e', 'David Guliciuc', 'Empty ring'),
    u('photo-1657208431551-cbf415b8ef26', 'Scarlett Alt', 'Teal and purple spotlights through haze'),
    u('photo-1786215327518-5d27ea8c5bb0', 'Tim Morgan', 'Two masked wrestlers in a ring with a referee'),
    u('photo-1771909716747-346cb2b09329', 'Arto Suraj', 'Empty indoor arena seating'),
    u('photo-1578269174936-2709b6aeb913', 'Giorgio Trovato', 'Gold trophy'),
    u('photo-1722599325109-6b081e0c7590', 'Johannes Spallek', 'Stage lights and fog'),
    u('photo-1786215327494-f136f019bf51', 'Tim Morgan', 'Masked wrestler against the ropes'),
    u('photo-1579150110123-55a33bcfa5d4', 'Anastase Maragos', 'Close-up of ropes'),
    u('photo-1638573615178-6f2950746614', 'Warner Shaw', 'Lights glowing in the dark'),
    u('photo-1770482228588-270b08d2d376', 'breizhography', 'Trophies on lit shelves'),
  ],
  music: [
    u('photo-1768053921689-1bc09db904c9', 'Nicolás Flor', 'Concert stage (current Music cover)'),
    u('photo-1610901056511-31de499995f0', 'Dorel Gnatiuc', 'Crowd silhouettes at a concert'),
    u('photo-1461784121038-f088ca1e7714', 'Gabriel Barletta', 'Red drum kit'),
    u('photo-1556379118-7034d926d258', 'Karim Manjra', 'Row of colourful guitars'),
    u('photo-1690460814053-5906ac3e90cd', 'Vitalii Khodzinskyi', 'Drum kit under a stage light'),
    u('photo-1574155267225-3b5423dd45d9', 'A J.', 'Silhouettes in a lit stadium'),
    u('photo-1614355013870-f3916bc15ced', 'Tapan Kumar Choudhury', 'Acoustic guitar on a stand'),
    u('photo-1694632157646-3a7292b82b0c', 'Hashem Al-Hebshi', 'Room full of guitars'),
    u('photo-1602369944529-c237ca143d09', 'Leslie del Moral', 'Crowd watching a night concert'),
    u('photo-1602001373676-64e1598dbc6a', 'Carlos Coronado', 'Drumsticks on a drum'),
    u('photo-1773433535783-64c7922c8ede', 'Juan Saav', 'Drum kit and guitar on stage'),
  ],
  story: [
    u('photo-1629906751901-df824699df71', 'Benjamin Lehman', 'Sunlit forest'),
    u('photo-1759968646998-d94b93904082', 'Gustavo Sánchez', 'Grand old library'),
    u('photo-1473163928189-364b2c4e1135', 'Andrew Neel', 'Old maps on the floor'),
    u('photo-1763953239955-ff27e74e7e84', 'Rain Wu', 'Fireflies in a dark forest'),
    u('photo-1711528263042-0e196e7d37c0', 'Marko Lengyel', 'Path through a pine forest'),
    u('photo-1576414160011-98dfab3aa889', 'Thomas Bormans', 'Bookshelves with a ladder'),
    u('photo-1637045569786-68fb4f0fba8d', 'Johanneke Kroesbergen-Kamps', 'Forest road on a foggy day'),
    u('photo-1470506926202-05d3fca84c9a', 'Natalie', 'Hands holding a treasure-hunt map'),
    u('photo-1792367260648-65faf2e5030b', 'Tony Kemp', 'Glowing bulbs along a forest path'),
    u('photo-1569586858726-03437c2f0d0e', 'Rafael Garcin', 'Stack of old books'),
    u('photo-1640073703101-80378639becd', 'Amandine Bataille', 'Leafy dirt road through trees'),
  ],
  bricks: [
    u('photo-1545558014-8692077e9b5c', 'Vanessa Bucceri', 'Colourful learning toys'),
    u('photo-1793369595854-eb29e45bcaf8', 'D K', 'Orange tower crane over a city'),
    u('photo-1575364289437-fb1479d52732', 'Michał Bożek', 'Colourful wooden blocks'),
    u('photo-1771350957379-5a6406e11702', 'Alan Villegas', 'Row of colourful houses'),
    u('photo-1618842676088-c4d48a6a7c9d', 'Tomáš Petz', 'Plastic building toy'),
    u('photo-1788608279515-c40d5170b244', 'Wenzy Wong', 'Yellow cranes over high-rises'),
    u('photo-1535572290543-960a8046f5af', 'Susan Holt Simpson', 'Alphabet cubes'),
    u('photo-1723822712485-5825962d51e4', 'Balint Miko', 'Narrow street of colourful buildings'),
    u('photo-1782240237977-769c5af12b79', 'Cool Photos', 'Skyline and cranes at sunset'),
    u('photo-1575881737088-a5a2bbf44e85', 'Michał Bożek', 'Colourful shape toys'),
    u('photo-1776718243958-c2361cbebc3f', 'Ian ODonnell', 'Skyscrapers under construction'),
  ],
  space: [
    u('photo-1541185933-ef5d8ed016c2', 'SpaceX', 'Rocket launching by day (current Space cover)'),
    u('photo-1614730321146-b6fa6a46bcb4', 'NASA', 'Earth seen from Apollo 17'),
    u('photo-1457364887197-9150188c107b', 'SpaceX', 'Rocket launch light trail at dusk'),
    u('photo-1653089116335-137ea51598a9', 'Javier Miranda', 'Bright star in deep space'),
    u('photo-1446776811953-b23d57bd21aa', 'NASA', 'Earth and clouds from orbit'),
    u('photo-1610296669228-602fa827fc1f', 'Aldebaran S', 'Blue nebula'),
    u('photo-1457365050282-c53d772ef8b2', 'SpaceX', 'Long-exposure launch arc over water'),
    u('photo-1741997699658-d37ee7a2e010', 'Logan Voss', 'Glowing planets in space'),
    u('photo-1451187580459-43490279c0fa', 'NASA', 'Earth at night from space'),
    u('photo-1548625361-58a9b86aa83b', 'Cosmic Timetraveler', 'Milky Way over mountains'),
    u('photo-1517976487492-5750f3195933', 'SpaceX', 'Spacecraft taking off'),
  ],
}

/**
 * TEAM PHOTOS: drop licensed images into src/assets/worlds/<world>/ (jpg, jpeg, png or webp) and push.
 * They are added automatically, in file-name order, ahead of that world's Unsplash photos.
 * Name a file "01 Credit text.jpg" to control the order and the credit shown on screen
 * (for example "01 Getty Images.jpg"); without a credit in the name it shows "Licensed by client".
 */
const TEAM_FILES = import.meta.glob('../assets/worlds/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>

function teamPhotos(world: IslandId): Pic[] {
  return Object.entries(TEAM_FILES)
    .filter(([path]) => path.split('/').slice(-2, -1)[0] === world)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const name = path.split('/').pop()!.replace(/\.[^.]+$/, '')
      const credit = name.replace(/^\d+[\s._-]*/, '').trim()
      return { local: url, credit: credit || 'Licensed by client', about: credit ? `Team photo (${credit})` : 'Team photo' }
    })
}

/** Team photos first, then the Unsplash set. */
const ALL: Record<IslandId, Pic[]> = Object.fromEntries(
  (Object.keys(WORLD_PHOTOS) as IslandId[]).map((w) => [w, [...teamPhotos(w), ...WORLD_PHOTOS[w]]]),
) as Record<IslandId, Pic[]>

export const photosFor = (world: IslandId) => ALL[world]

export const worldPic = (world: IslandId, n = 0): Pic => {
  const set = ALL[world]
  return set[((n % set.length) + set.length) % set.length]!
}

export const picUrl = (p: Pic, w = 900) => p.local ?? `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=70`
