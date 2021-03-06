import { Table } from "../src/index";
import { DATA_TYPES } from "../src/utils/constants";

describe("pg-sql", () => {
  // Instantiates an instance specifically designed for User model
  const User = new Table({
    table: "user",
    schema: "public",
    columns: [
      {from:'id', to:'id'},
      {from:'username', to: 'username'},
      {from: 'email', to: 'email'},
      {from: 'password', to: 'password'},
      {from: 'role', to: 'role'}
    ]
  });

  const Offer = new Table({
    table: "offer",
    schema: "public",
    columns: [
      {from: 'id', to: 'id'},
      {from: 'offerName',  to: 'offer_name'},
      {from: 'price', to: 'price'},
      {from: 'userId', to: 'user_id'},
    ]
  });

  describe("#constructor", () => {
    const table = 'test'
    const schema = 'public'
    const columns = [{from: 'id', to: 'id'}]

    it('should handle by default an initiation without the new keyword', () => {
      const t = Table({table,schema,columns})
      expect(t instanceof Table).toBeTruthy()
    })
    it('should throw an error if the table argument is not passed', () => {
      const t = () => new Table({schema,columns})
      expect(t).toThrowError('please specify a table as a string')
    })

    it('should throw an error if the columns argument has not a valid structure', () => {
      const t = () => new Table({table,schema,columns: [{}]})
      expect(t).toThrowError('please provide a valid column structure')
    })
    it('should default the schema to public if not provided', () => {
      const t = new Table({table,columns})
      expect(t instanceof Table).toBeTruthy()
      expect(t.schema).toBe('public')
    })
  })

  describe("#Select", () => {
    it("should select all records from User model", () => {
      const [sql, params] = User.select().from().end;

      expect(sql).toBe('SELECT * FROM public."user"');
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should select the id and username of the User model", () => {
      const [sql, params] = User.select(
        User.columns.id,
        User.columns.username
      ).from().end;
      expect(sql).toBe(
        'SELECT public."user"."id" as "id",public."user"."username" as "username" FROM public."user"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should return the id,username,email of the User model, with email renamed as user_email", () => {
      const [sql, params] = User.select(
        User.columns.id,
        User.columns.username,
        User.columns.email.as("user_email")
      ).from().end;
      expect(sql).toBe(
        'SELECT public."user"."id" as "id",public."user"."username" as "username",public."user"."email" as "user_email" FROM public."user"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should return the id,username,email,password of a user with id=1", () => {
      const [sql, params] = User.select(
        User.columns.id,
        User.columns.username,
        User.columns.email,
        User.columns.password
      )
        .from()
        .where(User.columns.id.equal(1)).end;

      expect(sql).toBe(
        'SELECT public."user"."id" as "id",public."user"."username" as "username",public."user"."email" as "email",public."user"."password" as "password" FROM public."user" WHERE public."user"."id"=$1'
      );
      expect(params).toEqual(expect.arrayContaining([1]));
    });

    it("should select the id and username of all users, casting the id to bigint", () => {
      const [sql, params] = User.select(
        User.columns.id.cast(DATA_TYPES.NUMERIC.BIG_INT),
        User.columns.username
      ).from().end;

      expect(sql).toBe(
        'SELECT public."user"."id"::bigint as "id",public."user"."username" as "username" FROM public."user"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should select the id and username of all users, casting the id to bigint. The id should be renamed to user_id", () => {
      const [sql, params] = User.select(
        User.columns.id.cast(DATA_TYPES.NUMERIC.BIG_INT).as("user_id"),
        User.columns.username
      ).from().end;

      expect(sql).toBe(
        'SELECT public."user"."id"::bigint as "user_id",public."user"."username" as "username" FROM public."user"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });
  });

  describe("#Insert", () => {
    it("should insert a record to User table", () => {
      const [sql, params] = User.insertInto().values([
        User.columns.id.equal(1),
        User.columns.username.equal("john"),
        User.columns.email.equal("john@gmail.com"),
        User.columns.password.equal("1234"),
        User.columns.role.equal("basic")
      ]).end;
      expect(sql).toBe(
        `INSERT INTO public."user" (id,username,email,password,role) VALUES ($1,$2,$3,$4,$5)`
      );
      expect(params).toEqual(
        expect.arrayContaining([1, "john", "john@gmail.com", "1234", "basic"])
      );
    });

    it("should insert multiple records to User table", () => {
      const [sql, params] = User.insertInto().values(
        [
          User.columns.id.equal(1),
          User.columns.username.equal("john"),
          User.columns.email.equal("john@gmail.com"),
          User.columns.password.equal("1234"),
          User.columns.role.equal("basic")
        ],
        [
          User.columns.id.equal(2),
          User.columns.username.equal("foo"),
          User.columns.email.equal("foo@gmail.com"),
          User.columns.password.equal("1234"),
          User.columns.role.equal("basic")
        ]
      ).end;
      expect(sql).toBe(
        'INSERT INTO public."user" (id,username,email,password,role) VALUES ($1,$2,$3,$4,$5),($6,$7,$8,$9,$10)'
      );
      expect(params).toEqual(
        expect.arrayContaining([
          1,
          "john",
          "john@gmail.com",
          "1234",
          "basic",
          2,
          "foo",
          "foo@gmail.com",
          "1234",
          "basic"
        ])
      );
    });

    it("should insert a record to User table and return all results", () => {
      const [sql, params] = User.insertInto()
        .values([
          User.columns.id.equal(1),
          User.columns.username.equal("john"),
          User.columns.email.equal("john@gmail.com"),
          User.columns.password.equal("1234"),
          User.columns.role.equal("basic")
        ])
        .returning()
        .all().end;
      expect(sql).toBe(
        `INSERT INTO public."user" (id,username,email,password,role) VALUES ($1,$2,$3,$4,$5) RETURNING *`
      );
      expect(params).toEqual(
        expect.arrayContaining([1, "john", "john@gmail.com", "1234", "basic"])
      );
    });

    it("should insert a record to User table and return only the id and username", () => {
      const [sql, params] = User.insertInto()
        .values([
          User.columns.id.equal(1),
          User.columns.username.equal("john"),
          User.columns.email.equal("john@gmail.com"),
          User.columns.password.equal("1234"),
          User.columns.role.equal("basic")
        ])
        .returning(User.columns.id, User.columns.username).end;
      expect(sql).toBe(
        `INSERT INTO public."user" (id,username,email,password,role) VALUES ($1,$2,$3,$4,$5) RETURNING "id","username"`
      );
      expect(params).toEqual(
        expect.arrayContaining([1, "john", "john@gmail.com", "1234", "basic"])
      );
    });

    it("shoyld insert a record returning all columns with their transformed name", () => {
      const [sql,params] = Offer.insertInto()
      .values([
        Offer.columns.id.equal(1),
        Offer.columns.offerName.equal("test"),
        Offer.columns.price.equal(1.00),
        Offer.columns.userId.equal(1)
      ])
      .returning(
        Offer.columns.offerName,
        Offer.columns.price
      )
      .end

      expect(sql).toBe(
        `INSERT INTO public."offer" (id,offer_name,price,user_id) VALUES ($1,$2,$3,$4) RETURNING "offer_name" as "offerName","price"`
      )
      expect(params).toEqual(
        expect.arrayContaining([1,"test",1.00,1])
      )
    })
  });

  describe("#Update", () => {
    it("should update the username of all records", () => {
      const [sql, params] = User.update().set(
        User.columns.username.equal("foo")
      ).end;

      expect(sql).toBe(`UPDATE public."user" SET username=$1`);
      expect(params).toEqual(expect.arrayContaining(["foo"]));
    });

    it("should update multiple attributes of a specified id", () => {
      const [sql, params] = User.update()
        .set(
          User.columns.username.equal("foo"),
          User.columns.email.equal("foo@gmail.com")
        )
        .where(User.columns.id.equal(10)).end;
      expect(sql).toBe(
        `UPDATE public."user" SET username=$1,email=$2 WHERE public."user"."id"=$3`
      );
      expect(params).toEqual(
        expect.arrayContaining(["foo", "foo@gmail.com", 10])
      );
    });

    it("should update multiple attributes of a specified id returning the id,username, and email of the updated record", () => {
      const [sql, params] = User.update()
        .set(
          User.columns.username.equal("foo"),
          User.columns.email.equal("foo@gmail.com")
        )
        .where(User.columns.id.equal(10))
        .returning(
          User.columns.id,
          User.columns.username,
          User.columns.email
        ).end;
      expect(sql).toBe(
        `UPDATE public."user" SET username=$1,email=$2 WHERE public."user"."id"=$3 RETURNING "id","username","email"`
      );
      expect(params).toEqual(
        expect.arrayContaining(["foo", "foo@gmail.com", 10])
      );
    });
  });

  describe("#Delete", () => {
    it("should delete all records of User table", () => {
      const [sql, params] = User.deleteFrom().end;

      expect(sql).toBe('DELETE FROM public."user"');
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should delete a set of records with a basic role", () => {
      const [sql, params] = User.deleteFrom().where(
        User.columns.role.equal("basic")
      ).end;

      expect(sql).toBe(
        'DELETE FROM public."user" WHERE public."user"."role"=$1'
      );
      expect(params).toEqual(expect.arrayContaining(["basic"]));
    });
  });

  describe("#Where", () => {
    it("should select a user based on his/her id", () => {
      const [sql, params] = User.select(
        User.columns.id,
        User.columns.username.as("user_name")
      )
        .from()
        .where(User.columns.id.equal(1)).end;

      expect(sql).toBe(
        'SELECT public."user"."id" as "id",public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id"=$1'
      );
      expect(params).toEqual(expect.arrayContaining([1]));
    });

    it("should select a user based on his/her username AND email", () => {
      const [sql, params] = User.select(
        User.columns.username.as("user_name"),
        User.columns.email.as("user_email")
      )
        .from()
        .where(
          User.columns.username
            .equal("foo")
            .and(User.columns.email.equal("foo@gmail.com"))
        ).end;
      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name",public."user"."email" as "user_email" FROM public."user" WHERE public."user"."username"=$1 AND public."user"."email"=$2'
      );
      expect(params).toEqual(expect.arrayContaining(["foo", "foo@gmail.com"]));
    });

    it("should select a user that has either a basic or edit role", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(
          User.columns.role.equal("basic").or(User.columns.role.equal("edit"))
        ).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."role"=$1 OR public."user"."role"=$2'
      );
      expect(params).toEqual(expect.arrayContaining(["basic", "edit"]));
    });

    it("should return a set of users with id greater than 10", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.gt(10)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id">$1'
      );
      expect(params).toEqual(expect.arrayContaining([10]));
    });

    it("should return a set of users with id greter or equal of 10", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.gte(10)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id">=$1'
      );
      expect(params).toEqual(expect.arrayContaining([10]));
    });

    it("should return a set of users with id less of 10", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.lt(10)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id"<$1'
      );
      expect(params).toEqual(expect.arrayContaining([10]));
    });

    it("should return a set of users with id less or equal of 10", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.lte(10)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id"<=$1'
      );
      expect(params).toEqual(expect.arrayContaining([10]));
    });

    it("should return a set of users with id greater of 10 and less than 20", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.gt(10).and(User.columns.id.lt(20))).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id">$1 AND public."user"."id"<$2'
      );
      expect(params).toEqual(expect.arrayContaining([10, 20]));
    });

    it("should return a set of users based on an IN operator", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.in(1, 2, 4)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" IN($1,$2,$3)'
      );
      expect(params).toEqual(expect.arrayContaining([1, 2, 4]));
    });

    it("should return a set of users based on an ANY operator", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.any(1, 2, 4)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" ANY($1,$2,$3)'
      );
      expect(params).toEqual(expect.arrayContaining([1, 2, 4]));
    });

    it("should return a set of users based on an ALL operator", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.all(1, 2, 4)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" ALL($1,$2,$3)'
      );
      expect(params).toEqual(expect.arrayContaining([1, 2, 4]));
    });

    it("should return a set of users that IS NOT included in the specified values", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.not().in(1, 2, 4)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" NOT IN($1,$2,$3)'
      );
      expect(params).toEqual(expect.arrayContaining([1, 2, 4]));
    });

    it("should return a set of users whose id IS NOT NULL", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(
          User.columns.id
            .is()
            .not()
            .null()
        ).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" IS NOT NULL'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should return a set of users whose id IS NULL", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.id.is().null()).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" IS NULL'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should return a set of users based on a REGEX match", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.username.match("^j.*")).end;

      expect(sql).toBe(
        `SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."username"~$1`
      );
      expect(params).toEqual(expect.arrayContaining(["^j.*"]));
    });

    it("should return a set of users based on a REGEX, case insensitive match", () => {
      const [sql, params] = User.select(User.columns.username.as("user_name"))
        .from()
        .where(User.columns.username.matchi("^J.*")).end;

      expect(sql).toBe(
        `SELECT public."user"."username" as "user_name" FROM public."user" WHERE public."user"."username"~*$1`
      );
      expect(params).toEqual(expect.arrayContaining(["^J.*"]));
    });

    it("should return a set of users based on a subquery in the WHERE clause", () => {
      const [sql, params] = User.select(
        User.columns.id,
        User.columns.username.as("user_name")
      )
        .from()
        .where(
          User.columns.id.in(
            Offer.select(Offer.columns.user_id)
              .from()
              .where(Offer.columns.id.in(1, 2, 3)).end
          )
        ).end;

      expect(sql).toBe(
        'SELECT public."user"."id" as "id",public."user"."username" as "user_name" FROM public."user" WHERE public."user"."id" IN(SELECT public."offer"."user_id" as "userId" FROM public."offer" WHERE public."offer"."id" IN($1,$2,$3))'
      );
      expect(params).toEqual(expect.arrayContaining([1, 2, 3]));
    });

    it("should return a set of users between a certain range", () => {
      const [sql, params] = User.select()
        .from()
        .where(User.columns.id.between(1, 10)).end;

      expect(sql).toBe(
        'SELECT * FROM public."user" WHERE public."user"."id" BETWEEN $1 AND $2'
      );
      expect(params).toEqual(expect.arrayContaining([1, 10]));
    });
  });

  describe("#Order by", () => {
    it("should sort the records with an ascending order based on the username", () => {
      const [sql, params] = User.select()
        .from()
        .orderBy(User.columns.username.asc()).end;

      expect(sql).toBe(
        'SELECT * FROM public."user" ORDER BY public."user"."username" ASC'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should sort the records with a descending order based on the username", () => {
      const [sql, params] = User.select()
        .from()
        .orderBy(User.columns.username.desc()).end;

      expect(sql).toBe(
        'SELECT * FROM public."user" ORDER BY public."user"."username" DESC'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should sort the records based on the username and id", () => {
      const [sql, params] = User.select()
        .from()
        .orderBy(User.columns.username.asc(), User.columns.id.desc()).end;

      expect(sql).toBe(
        'SELECT * FROM public."user" ORDER BY public."user"."username" ASC,public."user"."id" DESC'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });
  });

  describe("#offset and limit", () => {
    it("should limit the returned subset to 5 records", () => {
      const [sql, params] = User.select()
        .from()
        .limit(5).end;

      expect(sql).toBe('SELECT * FROM public."user" LIMIT $1');
      expect(params).toEqual([5]);
    });

    it("should offset the returned subset by 5 records", () => {
      const [sql, params] = User.select()
        .from()
        .offset(5).end;

      expect(sql).toBe('SELECT * FROM public."user" OFFSET $1');
      expect(params).toEqual([5]);
    });

    it("should offset the returned subset by 5 records and limit it to 3 records", () => {
      const [sql, params] = User.select()
        .from()
        .limit(3)
        .offset(5).end;

      expect(sql).toBe('SELECT * FROM public."user" LIMIT $1 OFFSET $2');
      expect(params).toEqual([3, 5]);
    });
  });

  describe("#Group by, Having and aggregation functions", () => {
    it("should group the records by username", () => {
      const [sql, params] = User.select(User.columns.username)
        .from()
        .groupBy(User.columns.username).end;
      expect(sql).toBe(
        'SELECT public."user"."username" as "username" FROM public."user" GROUP BY public."user"."username"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the records by username and email", () => {
      const [sql, params] = User.select(
        User.columns.username,
        User.columns.email
      )
        .from()
        .groupBy(User.columns.username, User.columns.email).end;
      expect(sql).toBe(
        'SELECT public."user"."username" as "username",public."user"."email" as "email" FROM public."user" GROUP BY public."user"."username",public."user"."email"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the offers by name and finds the AVG price", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.avg()
      )
        .from()
        .groupBy(Offer.columns.offer_name).end;
      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",AVG(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the offers by name and finds the SUM price", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.sum()
      )
        .from()
        .groupBy(Offer.columns.offer_name).end;
      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",SUM(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the offers by name and finds the MIN price", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.min()
      )
        .from()
        .groupBy(Offer.columns.offer_name).end;
      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",MIN(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the offers by name and finds the MAX price", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.max()
      )
        .from()
        .groupBy(Offer.columns.offer_name).end;
      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",MAX(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the offers by name and finds the COUNT price", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.count()
      )
        .from()
        .groupBy(Offer.columns.offer_name).end;
      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",COUNT(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name"'
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group the users by username, returning only those who have an id higher than 5", () => {
      const [sql, params] = User.select(
        User.columns.username,
        User.columns.id.sum()
      )
        .from()
        .groupBy(User.columns.username)
        .having(User.columns.id.sum().gt(5)).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "username",SUM(public."user"."id") as "id" FROM public."user" GROUP BY public."user"."username" HAVING SUM(public."user"."id")>$1'
      );
      expect(params).toEqual(expect.arrayContaining([5]));
    });

    it("should group the users by username, returning only those who have an id higher than 5 and less than 20", () => {
      const [sql, params] = User.select(
        User.columns.username,
        User.columns.id.sum()
      )
        .from()
        .groupBy(User.columns.username)
        .having(
          User.columns.id
            .sum()
            .gt(5)
            .and(User.columns.id.sum().lt(20))
        ).end;

      expect(sql).toBe(
        'SELECT public."user"."username" as "username",SUM(public."user"."id") as "id" FROM public."user" GROUP BY public."user"."username" HAVING SUM(public."user"."id")>$1 AND SUM(public."user"."id")<$2'
      );
      expect(params).toEqual(expect.arrayContaining([5, 20]));
    });

    it("should group the users by username, returning only those whose id is not null", () => {
      const [sql, params] = User.select(
        User.columns.username,
        User.columns.id.sum()
      )
        .from()
        .groupBy(User.columns.username)
        .having(
          User.columns.id.sum().in(
            Offer.select(Offer.columns.id)
              .from()
              .where(
                Offer.columns.id
                  .is()
                  .not()
                  .null()
              ).end
          )
        ).end;

      expect(sql).toBe(
        `SELECT public."user"."username" as "username",SUM(public."user"."id") as "id" FROM public."user" GROUP BY public."user"."username" HAVING SUM(public."user"."id") IN(SELECT public."offer"."id" as "id" FROM public."offer" WHERE public."offer"."id" IS NOT NULL)`
      );
      expect(params).toEqual(expect.arrayContaining([]));
    });

    it("should group offers based on the offer name, returning only those which aggregated price is between 10 to 50", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.sum()
      )
        .from()
        .groupBy(Offer.columns.offer_name)
        .having(Offer.columns.price.sum().between(10, 50)).end;

      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",SUM(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name" HAVING SUM(public."offer"."price") BETWEEN $1 AND $2'
      );
      expect(params).toEqual(expect.arrayContaining([10, 50]));
    });

    it("should group offers based on the offer name, returning only those which aggregated price is between 10 to 50 and does not equal 20", () => {
      const [sql, params] = Offer.select(
        Offer.columns.offer_name,
        Offer.columns.price.sum()
      )
        .from()
        .groupBy(Offer.columns.offer_name)
        .having(
          Offer.columns.price
            .sum()
            .between(10, 50)
            .and(Offer.columns.price.sum().unequal(20))
        ).end;

      expect(sql).toBe(
        'SELECT public."offer"."offer_name" as "offerName",SUM(public."offer"."price") as "price" FROM public."offer" GROUP BY public."offer"."offer_name" HAVING SUM(public."offer"."price") BETWEEN $1 AND $2 AND SUM(public."offer"."price")<>$3'
      );
      expect(params).toEqual(expect.arrayContaining([10, 50, 20]));
    });
  });
});
