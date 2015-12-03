INSERT INTO
  users
VALUES
  ( default, 'Rachel Goof', 'rachelgimp@example.com', 'fruitloops', null ),
  ( default, 'Richard Levy', 'richardlevy@example.com', 'down', null ),
  ( default, 'Lynold Friedman', 'lynoldfriedman@example.com', 'up', null ),
  ( default, 'Mary Cariah', 'marycariah@example.com', 'red', null ),
  ( default, 'Tom Strongholde', 'tomstrongholde@example.com', 'blue', null ),
  ( default, 'Sally Rallycaps', 'sallyrallycaps@example.com', 'green', null );

INSERT INTO
  games
VALUES
  ( default, (SELECT id FROM users WHERE id = 1), (SELECT id FROM users WHERE id = 2), null, null );
