package lol.dest4590.agario2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Agario2Application {

	public static void main(String[] args) {
		SpringApplication.run(Agario2Application.class, args);
	}

}
