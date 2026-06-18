package lol.dest4590.agario2.controllers;

import lol.dest4590.agario2.entities.GameUser;
import lol.dest4590.agario2.repositories.GameUserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final GameUserRepository userRepository;

    public UserController(GameUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public GameUser register(@RequestParam String username) {
        String cleanUsername = username.trim();

        if (cleanUsername.isEmpty()) {
            throw new RuntimeException("Username cannot be empty");
        }

        GameUser user = userRepository.findByUsername(cleanUsername)
                .orElseGet(() -> userRepository.save(new GameUser(cleanUsername)));

        user.setGamesPlayed(user.getGamesPlayed() + 1);
        return userRepository.save(user);
    }

    @GetMapping("/leaderboard")
    public List<GameUser> leaderboard() {
        return userRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getMaxSize().compareTo(a.getMaxSize()))
                .limit(10)
                .toList();
    }

    @PostMapping("/score")
    public GameUser updateScore(@RequestParam String username, @RequestParam Integer size) {
        GameUser user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.save(new GameUser(username)));

        if (size > user.getMaxSize()) {
            user.setMaxSize(size);
        }

        return userRepository.save(user);
    }
}