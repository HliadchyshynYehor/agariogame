package lol.dest4590.agario2.repositories;

import lol.dest4590.agario2.entities.GameUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameUserRepository extends JpaRepository<GameUser, Long> {

    Optional<GameUser> findByUsername(String username);
}