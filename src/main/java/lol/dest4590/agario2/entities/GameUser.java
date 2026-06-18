package lol.dest4590.agario2.entities;

import jakarta.persistence.*;

@Entity
public class GameUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private Integer maxSize = 10;

    private Integer gamesPlayed = 0;

    public GameUser() {
    }

    public GameUser(String username) {
        this.username = username;
        this.maxSize = 10;
        this.gamesPlayed = 0;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Integer getMaxSize() {
        return maxSize;
    }

    public Integer getGamesPlayed() {
        return gamesPlayed;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setMaxSize(Integer maxSize) {
        this.maxSize = maxSize;
    }

    public void setGamesPlayed(Integer gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }
}