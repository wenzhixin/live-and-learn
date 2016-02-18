## 批量修改 redmine 用户名称

redmine 的中文用户排序不好，当有很多人的时候指派给某个人或者选择跟踪会很麻烦，
故决定将名字显示为 “W 文志新” （姓拼音首字母 + 全名）的方式，虽说可以一个一个修改，
但是花时间，何不借此机会学习下操作 MySQL 数据库，实现批量修改呢。

**解决的问题：**

* MySQL 如何匹配中文记录
* 如何根据姓自动获取拼音首字母
* 如何将姓合并到姓名中并更新数据库

**知识点：**

* MySQL 语法：select，update
* MySQL 正则表达式：regexp
* MySQL 自定义函数：
```
create function function_name(参数列表)

　　　　return 返回值类型

　　　　函数体内容
```
* MySQL 自带函数：concat

### 1. MySQL 如何匹配中文记录

```sql
select
    firstname, lastname
from users
where status = 1 and not lastname regexp '^[0-9A-Za-z]';
```

注：中文简单的用 `not lastname regexp '^[0-9A-Za-z]'` 来表示，这样可以过滤那些不需要的记录。

### 2. 如何根据姓自动获取拼音首字母

在这里，我们创建了一个 `fristPinyin` 的函数：
```sql
delimiter $$
create function `fristPinyin`(p_name varchar(255)) returns varchar(255) charset utf8
begin
    declare v_return varchar(255);
    set v_return = elt(interval(conv(hex(left(convert(p_name using gbk), 1)), 16, 10),
        0xB0A1, 0xB0C5, 0xB2C1, 0xB4EE, 0xB6EA, 0xB7A2, 0xB8C1, 0xB9FE, 0xBBF7,
        0xBFA6, 0xC0AC, 0xC2E8, 0xC4C3, 0xC5B6, 0xC5BE, 0xC6DA, 0xC8BB,
        0xC8F6, 0xCBFA, 0xCDDA, 0xCEF4, 0xD1B9, 0xD4D1),
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z');
    return v_return;
end $$
```

注：生僻字会出错显示为 Z，因为排到常用字之后了。

使用我们自定义的函数：
```sql
select
    firstname, fristPinyin(lastname)
from users
where status = 1 and not lastname regexp '^[0-9A-Za-z]';
```

### 3. 如何将姓合并到姓名中并更新数据库

```sql
update
    users as u1,
    (select
        id, concat(lastname,firstname) firstname, fristPinyin(lastname) lastname
    from users
    where status = 1 and not lastname regexp '^[0-9A-Za-z]') as u2
set u1.firstname = u2.firstname, u1.lastname = u2.lastname
where u1.id = u2.id;
```

修改完成后删掉自定义的函数即可：
```sql
drop function `fristPinyin`;
```