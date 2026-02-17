require 'gosu'

class SudokuGame < Gosu::Window
  GRID_SIZE = 9
  CELL_SIZE = 60
  WINDOW_SIZE = GRID_SIZE * CELL_SIZE
  HEADER_HEIGHT = 60
  BUTTON_WIDTH = 150
  BUTTON_HEIGHT = 40
  MARGIN = 20

  def initialize
    super WINDOW_SIZE, WINDOW_SIZE + HEADER_HEIGHT
    self.caption = "Sudoku"

    # Initial Sudoku puzzle
    @grid = [
      [5, 3, nil, nil, 7, nil, nil, nil, nil],
      [6, nil, nil, 1, 9, 5, nil, nil, nil],
      [nil, 9, 8, nil, nil, nil, nil, 6, nil],
      [8, nil, nil, nil, 6, nil, nil, nil, 3],
      [4, nil, nil, 8, nil, 3, nil, nil, 1],
      [7, nil, nil, nil, 2, nil, nil, nil, 6],
      [nil, 6, nil, nil, nil, nil, 2, 8, nil],
      [nil, nil, nil, 4, 1, 9, nil, nil, 5],
      [nil, nil, nil, nil, 8, nil, nil, 7, 9]
    ]

    # Correct solution to be used in "Auto Finish"
    @solution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]

    # Store original grid for reset
    @original_grid = Marshal.load(Marshal.dump(@grid))

    # Track which cells are prefilled
    @prefilled = Array.new(GRID_SIZE) { Array.new(GRID_SIZE, false) }
    GRID_SIZE.times do |r|
      GRID_SIZE.times do |c|
        @prefilled[r][c] = !@grid[r][c].nil?
      end
    end

    @selected_row = 0
    @selected_col = 0
    @font = Gosu::Font.new(24)
    @bold_font = Gosu::Font.new(26)
    @win_font = Gosu::Font.new(36)
    @won = false
  end

  def update
    # No game logic to update continuously
  end

  def button_down(id)
    if id == Gosu::MsLeft
      handle_mouse_click(mouse_x, mouse_y)
    else
      handle_keyboard_input(id) unless @won
    end
  end

  # Handles arrow keys and number input
def handle_keyboard_input(id)
  case id
  when Gosu::KB_LEFT then @selected_col -= 1 if @selected_col > 0
  when Gosu::KB_RIGHT then @selected_col += 1 if @selected_col < GRID_SIZE - 1
  when Gosu::KB_UP then @selected_row -= 1 if @selected_row > 0
  when Gosu::KB_DOWN then @selected_row += 1 if @selected_row < GRID_SIZE - 1
  else
    return if @prefilled[@selected_row][@selected_col]

    number_keys = {
      Gosu::KB_1 => 1,
      Gosu::KB_2 => 2,
      Gosu::KB_3 => 3,
      Gosu::KB_4 => 4,
      Gosu::KB_5 => 5,
      Gosu::KB_6 => 6,
      Gosu::KB_7 => 7,
      Gosu::KB_8 => 8,
      Gosu::KB_9 => 9,
      Gosu::KB_0 => nil,
      Gosu::KB_BACKSPACE => nil
    }

    if number_keys.key?(id)
      @grid[@selected_row][@selected_col] = number_keys[id]
      check_win
    end
  end
end

  # Handle mouse button clicks on the buttons
  def handle_mouse_click(x, y)
    return unless y.between?(10, 10 + BUTTON_HEIGHT)

    if x.between?(MARGIN, MARGIN + BUTTON_WIDTH)
      reset_game
    elsif x.between?(WINDOW_SIZE - BUTTON_WIDTH - MARGIN, WINDOW_SIZE - MARGIN)
      auto_finish
    end
  end

  def reset_game
    @grid = Marshal.load(Marshal.dump(@original_grid))
    @won = false
  end

  def auto_finish
    @grid = Marshal.load(Marshal.dump(@solution))
    check_win
  end

  # Check if the current grid is a valid completed solution
  def check_win
    return if @grid.flatten.include?(nil)

    # Check rows
    @grid.each do |row|
      return unless row.uniq.sort == (1..9).to_a
    end

    # Check columns
    (0...GRID_SIZE).each do |col|
      column = @grid.map { |row| row[col] }
      return unless column.uniq.sort == (1..9).to_a
    end

    # Check 3x3 boxes
    [0, 3, 6].each do |row_start|
      [0, 3, 6].each do |col_start|
        box = []
        3.times do |i|
          3.times do |j|
            box << @grid[row_start + i][col_start + j]
          end
        end
        return unless box.uniq.sort == (1..9).to_a
      end
    end

    @won = true
  end

  def draw
    draw_header
    draw_background
    draw_grid
    draw_selection
    draw_numbers
    draw_win_message if @won
  end

  # Draw gray header with buttons
  def draw_header
    Gosu.draw_rect(0, 0, WINDOW_SIZE, HEADER_HEIGHT, Gosu::Color.argb(0xFFDDDDDD), 0)

    # Reset button
    Gosu.draw_rect(MARGIN, 10, BUTTON_WIDTH, BUTTON_HEIGHT, Gosu::Color::GRAY, 1)
    @font.draw_text("Reset", MARGIN + 40, 18, 2, 1.0, 1.0, Gosu::Color::BLACK)

    # Auto Finish button
    x = WINDOW_SIZE - BUTTON_WIDTH - MARGIN
    Gosu.draw_rect(x, 10, BUTTON_WIDTH, BUTTON_HEIGHT, Gosu::Color::GRAY, 1)
    @font.draw_text("Auto Finish", x + 15, 18, 2, 1.0, 1.0, Gosu::Color::BLACK)
  end

  def draw_background
    Gosu.draw_rect(0, HEADER_HEIGHT, WINDOW_SIZE, WINDOW_SIZE, Gosu::Color::WHITE, 0)
  end

  # Draw grid lines including thick lines for 3x3 subgrids
  def draw_grid
    # Thin cell lines
    (0..GRID_SIZE).each do |i|
      y = i * CELL_SIZE + HEADER_HEIGHT
      x = i * CELL_SIZE
      Gosu.draw_line(0, y, Gosu::Color::GRAY, WINDOW_SIZE, y, Gosu::Color::GRAY, 1)
      Gosu.draw_line(x, HEADER_HEIGHT, Gosu::Color::GRAY, x, HEADER_HEIGHT + WINDOW_SIZE, Gosu::Color::GRAY, 1)
    end

    # Thick lines for subgrids
    [0, 3, 6, 9].each do |i|
      y = i * CELL_SIZE + HEADER_HEIGHT
      x = i * CELL_SIZE
      Gosu.draw_rect(0, y - 2, WINDOW_SIZE, 4, Gosu::Color::BLACK, 2)
      Gosu.draw_rect(x - 2, HEADER_HEIGHT, 4, WINDOW_SIZE, Gosu::Color::BLACK, 2)
    end
  end

  # Highlight selected cell
  def draw_selection
    x = @selected_col * CELL_SIZE
    y = @selected_row * CELL_SIZE + HEADER_HEIGHT
    Gosu.draw_rect(x, y, CELL_SIZE, CELL_SIZE, Gosu::Color.argb(0x44FF9999), 0)
  end

  # Draw the numbers in the grid
  def draw_numbers
    GRID_SIZE.times do |row|
      GRID_SIZE.times do |col|
        num = @grid[row][col]
        next unless num
        x = col * CELL_SIZE + 20
        y = row * CELL_SIZE + HEADER_HEIGHT + 10
        font = @prefilled[row][col] ? @bold_font : @font
        font.draw_text(num.to_s, x, y, 1, 1.0, 1.0, Gosu::Color::BLACK)
      end
    end
  end

  # Show winning message
  def draw_win_message
    text = "You Win!"
    x = WINDOW_SIZE / 2 - @win_font.text_width(text) / 2
    y = HEADER_HEIGHT + WINDOW_SIZE / 2 - 20
    @win_font.draw_text(text, x, y, 10, 1.0, 1.0, Gosu::Color::GREEN)
  end
end

# Run the game
SudokuGame.new.show
