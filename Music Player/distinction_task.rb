require 'gosu'

# Main music player GUI class
class MusicPlayer < Gosu::Window
  WIDTH = 1700
  HEIGHT = 1200
  ALBUM_SIZE = 480
  PADDING = 20

  def initialize
    super WIDTH, HEIGHT
    self.caption = "Distinction Task - COS10009 - Music Player"

    @albums = load_albums('albums.txt')
    @font_large = Gosu::Font.new(38)
    @selected_album = nil
    @selected_track = nil
    @current_song = nil

    @button_play = Gosu::Image.from_text("Play", 38)
    @button_stop = Gosu::Image.from_text("Stop", 38)

    @play_button_area = [WIDTH - 180, HEIGHT - 80, 80, 40]
    @stop_button_area = [WIDTH - 90, HEIGHT - 80, 80, 40]

    position_albums
  end

# Track holds song name and file location
class Track
  attr_reader :name, :location

  def initialize(name, location)
    @name = name
    @location = location
  end
end

# Album holds metadata and image
class Album
  attr_reader :title, :artist, :image_path, :tracks
  attr_accessor :x, :y, :image

def initialize(title, artist, image_path, tracks)
  @title = title
  @artist = artist
  @image_path = image_path
  @tracks = tracks
  @x = 0
  @y = 0
  @image = nil
  end
end

# Read album and track data from file
def load_albums(filename)
  albums = []
  file = File.open(filename, 'r')
  count = file.gets.to_i
  count.times do
    title = file.gets.chomp
    artist = file.gets.chomp
    image = file.gets.chomp
    track_count = file.gets.to_i
    tracks = []
    track_count.times do
      track_name = file.gets.chomp
      track_location = file.gets.chomp
      tracks << Track.new(track_name, track_location)
    end
  albums << Album.new(title, artist, image, tracks)
  end
  file.close
  albums
end

  # Position album covers on grid
def position_albums
  total_albums = @albums.size
  cols = Math.sqrt(total_albums).ceil  # number of columns for a square-ish grid
  @albums.each_with_index do |album, index|
    row = index / cols
    col = index % cols
    album.x = col * (ALBUM_SIZE + PADDING) + PADDING
    album.y = row * (ALBUM_SIZE + PADDING) + PADDING
    album.image = Gosu::Image.new(album.image_path) rescue Gosu::Image.new("images/placeholder.jpg")
  end
end


  # Draw all interface elements
  def draw
    draw_gradient_background
    draw_albums
    draw_side_panel
    draw_buttons
  end

  # Draw a vertical gradient for background
  def draw_gradient_background
    Gosu.draw_rect(0, 0, WIDTH, HEIGHT, Gosu::Color::BLUE, -1)
    (0...HEIGHT).each do |y|
      ratio = y.to_f / HEIGHT
      color = Gosu::Color.rgba(30, 144, 255 - (155 * ratio).to_i, 255)
      Gosu.draw_rect(0, y, WIDTH, 1, color, 0)
    end
  end

  # Draw albums and titles
  def draw_albums
    @albums.each do |album|
      album.image.draw(album.x, album.y, 0, ALBUM_SIZE / album.image.width.to_f, ALBUM_SIZE / album.image.height.to_f)
    end
  end

  # Side panel for track list and info
  def draw_side_panel
    panel_x = WIDTH * 0.6
    draw_rect(panel_x, 0, WIDTH - panel_x, HEIGHT, Gosu::Color::rgba(0, 0, 0, 100), 0)

    if @selected_album
      @font_large.draw_text("Album: #{@selected_album.title}", panel_x + 10, 10, 1, 1, 1, Gosu::Color::WHITE)
      @font_large.draw_text("Artist: #{@selected_album.artist}", panel_x + 10, 60, 1, 1, 1, Gosu::Color::WHITE)

      @selected_album.tracks.each_with_index do |track, i|
        y = 110 + i * 30
        color = (@selected_track == track) ? Gosu::Color::YELLOW : Gosu::Color::WHITE
        @font_large.draw_text("#{i + 1}. #{track.name}", panel_x + 10, y, 1, 1, 1, color)
      end

      if @selected_track
        @font_large.draw_text("Now playing: #{@selected_track.name}", panel_x + 10, HEIGHT - 50, 1, 1, 1, Gosu::Color::WHITE)
      end
    else
      @font_large.draw_text("Click an album to view tracks", panel_x + 10, 10, 1, 1, 1, Gosu::Color::WHITE)
    end
  end

  # Draw the media control buttons
  def draw_buttons
    @button_play.draw(@play_button_area[0], @play_button_area[1], 1)
    @button_stop.draw(@stop_button_area[0], @stop_button_area[1], 1)
  end

  # Handle mouse clicks
  def button_down(id)
    if id == Gosu::MsLeft
      return if handle_button_click(mouse_x, mouse_y)
      handle_album_click(mouse_x, mouse_y) || handle_track_click(mouse_x, mouse_y)
    end
  end

  # Handle album selection
  def handle_album_click(x, y)
    @albums.each do |album|
      if x >= album.x && x <= album.x + ALBUM_SIZE && y >= album.y && y <= album.y + ALBUM_SIZE
        @selected_album = album
        @selected_track = nil
        stop_song
        return true
      end
    end
    false
  end

  # Handle track selection
  def handle_track_click(x, y)
    return false unless @selected_album
    panel_x = WIDTH * 0.6
    return false if x < panel_x

    @selected_album.tracks.each_with_index do |track, i|
      track_y = 70 + i * 30
      if y >= track_y && y <= track_y + 25
        play_track(track)
        return true
      end
    end
    false
  end

  # Handle button actions
  def handle_button_click(x, y)
    px, py, pw, ph = @play_button_area
    if x.between?(px, px + pw) && y.between?(py, py + ph)
      play_track(@selected_track) if @selected_track
      return true
    end

    sx, sy, sw, sh = @stop_button_area
    if x.between?(sx, sx + sw) && y.between?(sy, sy + sh)
      stop_song
      return true
    end

    false
  end

  # Stop playback
  def stop_song
    @current_song&.stop
    @current_song = nil
  end

  # Play the selected track
  def play_track(track)
    stop_song
    @selected_track = track
    @current_song = Gosu::Song.new(track.location)
    @current_song.play(false)
  rescue => e
    puts "Error playing track: #{e.message}"
  end
end

# Launch the application
MusicPlayer.new.show
