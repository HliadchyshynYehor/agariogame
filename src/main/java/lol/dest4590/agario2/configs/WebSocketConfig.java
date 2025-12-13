package lol.dest4590.agario2.configs;

import lol.dest4590.agario2.handlers.FoodHandler;
import lol.dest4590.agario2.handlers.PlayerHandler;
import lol.dest4590.agario2.models.Player;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.concurrent.ConcurrentHashMap;


@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    public final static ConcurrentHashMap<WebSocketSession, Player> sessions = new ConcurrentHashMap<>();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(playerHandler(), "/player").setAllowedOrigins("*");
        registry.addHandler(foodHandler(), "/food").setAllowedOrigins("*");

    }

    @Bean
    public WebSocketHandler playerHandler() {
        return new PlayerHandler();
    }

    @Bean
    public WebSocketHandler foodHandler() {
        return new FoodHandler();
    }
}

