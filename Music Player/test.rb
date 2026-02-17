# Resubmission 19/05 as I have gone back through all my portfolio tasks
# to include comments to bring better understanding and
# to follow correct principles.

require 'gosu'

module ZOrder
  BACKGROUND, PLAYER, UI = *0..2
end

# Dimension class to keep track of clickable areas
class Dimension
  attr_accessor :leftX, :topY, :rightX, :bottomY

  def initialize(leftX, topY, rightX, bottomY)
    @leftX = leftX
    @topY = topY
    @rightX = rightX
    @bottomY = bottomY
  end

  def contains?(x, y)
    x >= @leftX && x <= @rightX && y >= @topY && y <= @bottomY
  end
end

# ArtWork class now handles scaling of image and dimensions
class ArtWork
  attr_accessor :bmp, :dim, :scale

  def initialize(file, leftX, topY, scale=0.3)
    @bmp = Gosu::Image.new(file)
    @scale = scale
    width = (@bmp.width * scale).to_i
    height = (@bmp.height * scale).to_i
    @dim = Dimension.new(leftX, topY, leftX + width, topY + height)
  end
end

# Track class stores track details
class Track
  attr_accessor :name, :location

  def initialize(name, location)
    @name = name
    @location = location
  end
end

# Album class stores album info, artwork and tracks
class Album
  attr_accessor :title, :artist, :artwork, :tracks

  def initialize(title, artist, artwork)
    @title = title
    @artist = artist
    @artwork = artwork
    @tracks = []
  end
end

# Main class for the music player window
class MusicPlayer < Gosu::Window
  def initialize
    super 800, 600
    self.caption = "Ruby Music Player"

    @font = Gosu::Font.new(20)
    @albums = read_albums("albums.txt")

    @now_playing = nil
  end

  def read_albums(file)
    albums = []
    scale = 0.3
    leftX = 20
    topY = 20
    y_spacing = 140  # spacing between albums vertically

    File.open(file, 'r') do |a_file|
      while !a_file.eof?
        title = a_file.gets.chomp
        artist = a_file.gets.chomp
        artwork_file = a_file.gets.chomp

        artwork = ArtWork.new(artwork_file, leftX, topY, scale)
        album = Album.new(title, artist, artwork)

        track_count = a_file.gets.to_i
        track_count.times do
          track_name = a_file.gets.chomp
          track_location = a_file.gets.chomp
          album.tracks << Track.new(track_name, track_location)
        end

        albums << album

        # Next album position down the screen
        topY += y_spacing
      end
    end
    albums
  end

  def draw
    draw_albums(@albums)
    draw_now_playing
  end

  def draw_albums(albums)
    albums.each do |album|
      # Draw scaled artwork
      album.artwork.bmp.draw(album.artwork.dim.leftX, album.artwork.dim.topY, ZOrder::PLAYER, album.artwork.scale, album.artwork.scale)

      # Draw album title below artwork
      @font.draw_text(album.title, album.artwork.dim.leftX, album.artwork.dim.bottomY + 5, ZOrder::UI, 1, 1, Gosu::Color::WHITE)
    end
  end

  def draw_now_playing
    return unless @now_playing

    @font.draw_text("Now Playing:", 400, 20, ZOrder::UI, 1, 1, Gosu::Color::WHITE)
    @font.draw_text("#{@now_playing.name}", 400, 50, ZOrder::UI, 1, 1, Gosu::Color::WHITE)
  end

  def button_down(id)
    case id
    when Gosu::MsLeft
      handle_click(mouse_x, mouse_y)
    when Gosu::KbEscape
      close
    end
  end

  def handle_click(x, y)
    # Check if click is on an album artwork
    @albums.each do |album|
      if album.artwork.dim.contains?(x, y)
        # If so, play the first track of that album (for simplicity)
        if album.tracks.any?
          @now_playing = album.tracks.first
        else
          @now_playing = nil
        end
        break
      end
    end
  end
end

MusicPlayer.new.show
